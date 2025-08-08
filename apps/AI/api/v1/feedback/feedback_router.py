from fastapi import APIRouter
from apps.AI.api.v1.feedback.feedback_schema import FeedbackEvalRequest, FeedbackEvalResponse
from apps.AI.api.v1.feedback import feedback_service

router = APIRouter(prefix="/api/v1/feedback", tags=["Feedback"])

@router.post("/eval", response_model=FeedbackEvalResponse)
def evaluate_feedback(request: FeedbackEvalRequest):
    accuracy, feedback_text = feedback_service.generate_feedback_response(request.sentences)
    return FeedbackEvalResponse(accuracy=accuracy, feedback_text=feedback_text)
