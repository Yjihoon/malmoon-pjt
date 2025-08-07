package com.communet.malmoon.storybook.dto;
/**
 * AI 피드백 상세정보 응답용 DTO
 */

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class FeedbackDetailResponseDto {
    private String storybookTitle;
    private double accuracy;
    private String feedbackText;
}
