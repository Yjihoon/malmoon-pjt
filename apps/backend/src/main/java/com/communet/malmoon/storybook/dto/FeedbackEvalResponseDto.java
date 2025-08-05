package com.communet.malmoon.storybook.dto;

import lombok.Data;

import java.util.List;

@Data
public class FeedbackEvalResponseDto {
    private double overallAccuracy;
    private String feedbackText;
    private List<SentenceFeedback> sentences;

    @Data
    public static class SentenceFeedback {
        private Long sentenceId;
        private double accuracy;
        private String comment;  // 필요 시 사용
    }
}