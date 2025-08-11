from api.v1.feedback import feedback_service
from api.v1.feedback.feedback_schema import FeedbackEvalRequest, FeedbackEvalResponse, InitialEvalRequest
from fastapi import APIRouter

router = APIRouter()


@router.post("/eval", response_model=FeedbackEvalResponse)
def evaluate_feedback(request: FeedbackEvalRequest):
    accuracy, feedback_text = feedback_service.generate_feedback_response(request.sentences)
    return FeedbackEvalResponse(accuracy=accuracy, feedbackText=feedback_text)

@router.post("/initialeval", response_model=FeedbackEvalResponse)
def initial_evaluate_feedback(request: InitialEvalRequest):
    accuracy, feedback_text = feedback_service.generate_initial_feedback_response(request.words)
    return FeedbackEvalResponse(accuracy=accuracy, feedbackText=feedback_text)

