import json
import logging
import re
import os
from typing import AsyncGenerator, Optional
from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
import httpx

from config import settings
from models import ChatRequest, ChatResponse, RecallRequest, RetainRequest, SearchRequest, ExecuteRequest, FileReadRequest
from memory_client import retain_memory, recall_memory, HINDSIGHT_URL
from tools import web_search, execute_code

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("apex_backend")

app = FastAPI(title="Apex AI Agent", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = AsyncOpenAI(
    api_key=settings.nvidia_api_key,
    base_url=settings.nvidia_base_url,
    timeout=120.0,
)

async def safe_retain_memory(user_id: str, user_msg: str, assistant_msg: str):
    try:
        await retain_memory(user_id, user_msg, assistant_msg)
    except Exception as e:
        print(f"Memory retain failed: {e}")

def select_model(prompt: str, user_choice: str = None) -> str:
    if user_choice and user_choice.strip() != "" and user_choice.lower() != "auto":
        return user_choice
    prompt_lower = prompt.lower()
    math_keywords = {"math", "solve", "equation", "prove", "logic", "reasoning", "calculate"}
    if any(kw in prompt_lower for kw in math_keywords):
        return "deepseek-ai/deepseek-r1"
    return "meta/llama-4-maverick-17b-128e-instruct"

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    model = select_model(request.message, request.model_choice)
    user_id = "default_user"
    system_prompt = "You are Apex, a helpful AI assistant. Respond concisely and clearly."
    
    # Inject active file context if provided
    if request.active_file_path and request.active_file_content:
        system_prompt += f"\n\n[Active Project File Context]\nPath: {request.active_file_path}\nContent:\n```\n{request.active_file_content}\n```\n"

    # Memory recall
    try:
        if request.message and request.message.strip():
            memories = await recall_memory(user_id, request.message)
            if memories:
                system_prompt += f"\n\nRelevant memories:\n{memories}\n"
    except Exception as e:
        logger.warning(f"Memory recall failed: {e}")
    
    # Check for image (vision request)
    image_base64 = None
    if hasattr(request, 'image') and request.image:
        image_base64 = request.image
        logger.info(f"📷 Vision request: image provided")
    
    # Also extract image from message if embedded
    if not image_base64 and request.message and '[Image: data:image/' in request.message:
        match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', request.message)
        if match:
            image_base64 = match.group(1)
            logger.info(f"📷 Vision request: image extracted from message")
            # Clean the message
            request.message = re.sub(r'\[Image: data:image/[^\]]+\]', '', request.message).strip()
    
    # Build messages based on whether we have an image
    if image_base64:
        # Vision request - use vision format
        logger.info(f"🖼️ Processing vision request with model: meta/llama-4-maverick-17b-128e-instruct")
        content = [
            {
                "type": "text", 
                "text": request.message if request.message else "What's in this image? Describe it in detail."
            },
            {
                "type": "image_url", 
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
            }
        ]
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content}
        ]
        # Use vision-capable model
        vision_model = "meta/llama-4-maverick-17b-128e-instruct"
        try:
            completion = await openai_client.chat.completions.create(
                model=vision_model,
                messages=messages,
                temperature=0.5,
                max_tokens=1024
            )
            response_text = completion.choices[0].message.content
            background_tasks.add_task(safe_retain_memory, user_id, request.message, response_text)
            return ChatResponse(response=response_text, model_used=vision_model)
        except Exception as e:
            logger.error(f"Vision API error: {e}")
            raise HTTPException(status_code=502, detail=f"Vision failed: {str(e)}")
    
    # Regular text request
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.message}
    ]
    
    try:
        completion = await openai_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.5,
            max_tokens=2048
        )
        response_text = completion.choices[0].message.content
        background_tasks.add_task(safe_retain_memory, user_id, request.message, response_text)
        return ChatResponse(response=response_text, model_used=model)
    except Exception as e:
        logger.error(f"API error: {e}")
        raise HTTPException(status_code=502, detail=f"API request failed: {str(e)}")

# Keep existing endpoints for tools, memory, etc.
@app.post("/tools/search")
async def direct_web_search(request: SearchRequest):
    try:
        results = await web_search(request.query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/execute")
async def direct_code_execution(request: ExecuteRequest):
    if not settings.code_execution_enabled:
        raise HTTPException(status_code=403, detail="Code execution disabled")
    try:
        output = await execute_code(request.code, request.language)
        return {"output": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/stats")
async def memory_stats():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{HINDSIGHT_URL}/health", timeout=5.0)
            hindsight_health = response.json() if response.status_code == 200 else {"status": "unhealthy"}
        return {"status": "connected", "hindsight_service_health": hindsight_health}
    except Exception as e:
        return {"status": "disconnected", "detail": str(e)}

@app.get("/tools/status")
async def tools_status():
    return {
        "web_search": {"available": bool(settings.tavily_api_key)},
        "code_execution": {"enabled": settings.code_execution_enabled}
    }

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    # Check for image (vision request)
    image_base64 = None
    if hasattr(request, 'image') and request.image:
        image_base64 = request.image
        logger.info(f"📷 Streaming vision request: image provided")
    
    # Also extract image from message if embedded
    if not image_base64 and request.message and '[Image: data:image/' in request.message:
        match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', request.message)
        if match:
            image_base64 = match.group(1)
            logger.info(f"📷 Streaming vision request: image extracted from message")
            # Clean the message
            request.message = re.sub(r'\[Image: data:image/[^\]]+\]', '', request.message).strip()

    # Determine model
    if image_base64:
        model = "meta/llama-4-maverick-17b-128e-instruct"
        content = [
            {
                "type": "text", 
                "text": request.message if request.message else "What's in this image? Describe it in detail."
            },
            {
                "type": "image_url", 
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
            }
        ]
    else:
        model = select_model(request.message or "", request.model_choice)
        content = request.message or ""

    system_prompt = "You are Apex, a helpful AI assistant. Respond concisely and clearly."
    
    # Inject active file context if provided
    if request.active_file_path and request.active_file_content:
        system_prompt += f"\n\n[Active Project File Context]\nPath: {request.active_file_path}\nContent:\n```\n{request.active_file_content}\n```\n"

    # Memory recall
    user_id = "default_user"
    try:
        if request.message and request.message.strip():
            memories = await recall_memory(user_id, request.message)
            if memories:
                system_prompt += f"\n\nRelevant memories:\n{memories}\n"
    except Exception as e:
        logger.warning(f"Memory recall failed: {e}")

    async def generate():
        try:
            yield f"data: {json.dumps({'model_used': model})}\n\n"
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ]
            
            completion = await openai_client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True
            )
            async for chunk in completion:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")

def scan_directory(dir_path: str) -> list:
    items = []
    try:
        entries = sorted(os.scandir(dir_path), key=lambda e: (not e.is_dir(), e.name.lower()))
        for entry in entries:
            # Exclude large or build metadata directories
            if entry.name in {".git", "node_modules", ".next", "venv", "__pycache__", ".gemini", ".idea", ".vscode", "dist", "build"}:
                continue
            # Exclude lockfiles and build outputs
            if entry.name in {"package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock"}:
                continue
            
            node = {
                "name": entry.name,
                "path": entry.path,
                "isDir": entry.is_dir()
            }
            if entry.is_dir():
                node["children"] = scan_directory(entry.path)
            items.append(node)
    except Exception as e:
        logger.warning(f"Error scanning directory {dir_path}: {e}")
    return items

@app.get("/file/tree")
async def file_tree(path: str):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Directory not found")
    if not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path is not a directory")
    return scan_directory(path)

@app.post("/file/read")
async def read_file_endpoint(request: FileReadRequest):
    if not os.path.exists(request.path):
        raise HTTPException(status_code=404, detail="File not found")
    if not os.path.isfile(request.path):
        raise HTTPException(status_code=400, detail="Path is not a file")
    try:
        with open(request.path, 'rb') as f:
            chunk = f.read(1024)
            if b'\x00' in chunk:
                raise HTTPException(status_code=400, detail="Binary files cannot be read as text")
        
        with open(request.path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        return {"content": content, "path": request.path}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

@app.post("/file/open")
async def open_file_endpoint(request: FileReadRequest):
    return await read_file_endpoint(request)

