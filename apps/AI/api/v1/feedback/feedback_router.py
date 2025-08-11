from api.v1.feedback import feedback_service
from api.v1.feedback.feedback_schema import FeedbackEvalRequest, FeedbackEvalResponse
from fastapi import APIRouter

router = APIRouter()


@router.post("/eval", response_model=FeedbackEvalResponse)
def evaluate_feedback(request: FeedbackEvalRequest):
    accuracy, feedback_text = feedback_service.generate_feedback_response(request.sentences)
    return FeedbackEvalResponse(accuracy=accuracy, feedback_text=feedback_text)
