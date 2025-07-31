from fastapi import APIRouter, HTTPException
from .dto.aac_create_req import AacImageRequest
from .dto.aac_create_res import AacImageResponse
from .aac_ai_service import generate_preview_image, confirm_image_upload

router = APIRouter()

@router.post("/generate", response_model=AacImageResponse)
def generate_image(req: AacImageRequest):
    preview_url = generate_preview_image(req)
    return AacImageResponse(preview_url=preview_url)

@router.post("/confirm")
def confirm_image(filename: str):
    try:
        s3_url = confirm_image_upload(filename)
        return {"s3_url": s3_url}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")