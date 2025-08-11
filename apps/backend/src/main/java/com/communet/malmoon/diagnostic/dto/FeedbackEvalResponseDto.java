package com.communet.malmoon.diagnostic.dto;

import lombok.*;

/** LLM 평가 응답 */
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class FeedbackEvalResponseDto {
    private double overallAccuracy;  // 0~100
    private String feedbackText;
}