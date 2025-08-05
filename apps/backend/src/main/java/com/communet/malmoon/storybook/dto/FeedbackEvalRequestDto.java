package com.communet.malmoon.storybook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackEvalRequestDto {
    private Long sentenceId;
    private String groundTruth;  // 원문
    private String hypothesis;   // STT 결과
}
