package com.communet.malmoon.diagnostic.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** 종료 응답 */
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class FinishResponse {
    private UUID attemptId;
    private BigDecimal accuracy;
    private String feedbackText;
    private List<ItemResult> items;

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class ItemResult {
        private Integer itemIndex;
        private String targetText;
        private String sttText;
        private Integer score; // null
    }
}