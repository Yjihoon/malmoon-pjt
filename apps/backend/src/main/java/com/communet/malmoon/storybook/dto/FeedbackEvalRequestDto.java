package com.communet.malmoon.storybook.dto;
/**
 * FastAPI 요청 DTO 정의
 * Spring Boot가 FastAPI에 보낼 평가 요청 데이터
 */

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class FeedbackEvalRequestDto {
    private Long childId;
    private LocalDate date;
    private List<SentencePair> sentences;

    @Data
    public static class SentencePair {
        private Long sentenceId;
        private String original;
        private String stt;
    }
}
