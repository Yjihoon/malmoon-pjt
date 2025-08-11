package com.communet.malmoon.storybook.dto;
/**
 * FastAPI 요청 DTO 정의
 * Spring Boot가 FastAPI에 보낼 평가 요청 데이터
 */
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class FeedbackEvalRequestDto {
    @JsonProperty("child_id")
    private Long childId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private List<SentencePair> sentences;

    @Data
    public static class SentencePair {

        @JsonProperty("sentence_id")
        private Long sentenceId;

        private String original;
        private String stt;
    }
}
