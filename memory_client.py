import os
import logging
from typing import Dict, Any, List
import httpx

logger = logging.getLogger("memory_client")

HINDSIGHT_URL = os.getenv("HINDSIGHT_URL", "http://localhost:8888")

async def retain_memory(user_id: str, user_msg: str, assistant_msg: str = "") -> Dict[str, Any]:
    """Store a conversation in Hindsight memory."""
    url = f"{HINDSIGHT_URL}/v1/default/banks/{user_id}/memories"
    
    # Format according to the API spec - using items array
    content_str = f"User: {user_msg}\nAssistant: {assistant_msg}" if assistant_msg else user_msg
    payload = {
        "items": [
            {
                "content": content_str,
                "context": "chat_conversation"
            }
        ],
        "async": False
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=2.0)
        response.raise_for_status()
        return response.json()

async def recall_memory(user_id: str, query: str) -> str:
    """Search for relevant memories in Hindsight."""
    url = f"{HINDSIGHT_URL}/v1/default/banks/{user_id}/memories/recall"
    
    payload = {
        "query": query,
        "budget": "mid",
        "max_tokens": 2000
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=2.0)
        response.raise_for_status()
        data = response.json()
        
        # Extract text from results
        results = data.get("results", [])
        if results:
            memories = [r.get("text", "") for r in results if r.get("text")]
            if memories:
                return "\n".join([f"- {m}" for m in memories])
        return ""

async def reflect_memory(user_id: str, topic: str) -> str:
    """Get insights synthesized across multiple memories."""
    url = f"{HINDSIGHT_URL}/v1/default/banks/{user_id}/reflect"
    
    payload = {
        "query": topic,
        "budget": "low"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=2.0)
        response.raise_for_status()
        data = response.json()
        return data.get("text", "")
