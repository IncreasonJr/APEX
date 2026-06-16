import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables and/or a .env file.
    Uses pydantic-settings for robust validation.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    # NVIDIA API Key is required for NVIDIA NIM integration.
    nvidia_api_key: str = Field(..., validation_alias="NVIDIA_API_KEY")
    
    @field_validator("nvidia_api_key")
    @classmethod
    def validate_nvidia_api_key(cls, v: str) -> str:
        if not v.startswith("nvapi-"):
            raise ValueError("NVIDIA_API_KEY must start with 'nvapi-'")
        return v
    
    # Base URL for NVIDIA API, defaulting to the official integrate endpoint.
    nvidia_base_url: str = Field(
        "https://integrate.api.nvidia.com/v1", 
        validation_alias="NVIDIA_BASE_URL"
    )
    
    # Default model if none specified and routing falls back to default.
    default_model: str = Field(
        "meta/llama-4-maverick-17b-128e-instruct", 
        validation_alias="DEFAULT_MODEL"
    )
    
    # Tavily API Key for web search tool.
    tavily_api_key: str | None = Field(None, validation_alias="TAVILY_API_KEY")
    
    # Whether safe Docker code execution is enabled.
    code_execution_enabled: bool = Field(True, validation_alias="CODE_EXECUTION_ENABLED")

# Instantiate settings. Pydantic will validate the env variables.
try:
    settings = Settings()
except Exception as e:
    import sys
    print(
        f"\n[ERROR] Configuration validation failed:\n{e}\n"
        "Please ensure you have set NVIDIA_API_KEY in your environment or a .env file.\n"
        "Refer to .env.example for guidance.\n",
        file=sys.stderr
    )
    # Re-raise to prevent the application from launching in a broken state
    raise e
