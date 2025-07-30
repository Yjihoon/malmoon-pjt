from pydantic import BaseModel

class AacImageResponse(BaseModel):
    preview_url: str
