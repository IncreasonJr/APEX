from typing import Optional
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    """
    Schema representing a chat request from the user.
    """
    message: Optional[str] = Field(
        "", 
        description="The message prompt to send to the AI agent backend."
    )
    model_choice: Optional[str] = Field(
        "auto", 
        description="Specify a particular NIM model to bypass automatic routing, or use 'auto'."
    )
    image: Optional[str] = Field(
        None,
        description="Optional base64 encoded image for vision tasks (without data:image prefix)."
    )
    active_file_path: Optional[str] = Field(
        None,
        description="Absolute path to the currently active project file."
    )
    active_file_content: Optional[str] = Field(
        None,
        description="Raw text content of the active project file."
    )

class ChatResponse(BaseModel):
    response: str = Field(..., description="The text response from the model")
    model_used: str = Field(..., description="The model used to fulfill the request")

class FileReadRequest(BaseModel):
    """
    Request schema to read a specific local file.
    """
    path: str = Field(..., description="Absolute path to the file on the host OS.")

class RecallRequest(BaseModel):
    query: str = Field(..., description="The query to search memories")

class RetainRequest(BaseModel):
    content: str = Field(..., description="The fact or observation to store")

class SearchRequest(BaseModel):
    query: str = Field(..., description="The search query for Tavily")

class ExecuteRequest(BaseModel):
    code: str = Field(..., description="The code to execute")
    language: Optional[str] = Field("python", description="Programming language")
