package com.communet.malmoon.diagnostic.dto;

import lombok.*;
import java.util.List;

/** LLM 평가 요청 */
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class FeedbackEvalRequestDto {
    private List<WordsPair> words;
    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class WordsPair {
        private Integer itemIndex;
        private String targetText;
        private String sttText;
    }
}