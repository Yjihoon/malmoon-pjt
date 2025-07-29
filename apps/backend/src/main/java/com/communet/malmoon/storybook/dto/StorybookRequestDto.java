package com.communet.malmoon.storybook.dto;

import lombok.Data;
import java.util.List;

@Data
public class StorybookRequestDto {
    private String title;
    private String author;
    private String illustrator;
    private String isbn;
    private String readAge;
    private int publishedYear;
    private String publisher;
    private String classification;
    private int paragraphInfoCount;
    private List<ParagraphInfo> paragraphInfo;

    @Data
    public static class ParagraphInfo {
        private String srcTextID;
        private String srcText;
        private int srcPage;
        private int srcSentenceEA;
        private int srcWordEA;
    }
}
