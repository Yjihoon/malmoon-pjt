package com.communet.malmoon.storybook.service;

// StorbookRequestDto를 받아서 문장을 분리하고 Storybook과 StorybookSentence를 저장하는 로직

import com.communet.malmoon.storybook.domain.Storybook; // DB 테이블 클래스
import com.communet.malmoon.storybook.domain.StorybookSentence; // DB 테이블 클래스
import com.communet.malmoon.storybook.dto.StorybookRequestDto; // DTO
import com.communet.malmoon.storybook.repository.StorybookRepository; // JPA 인터페이스
import com.communet.malmoon.storybook.repository.StorybookSentenceRepository; // JPA 인터페이스
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor

public class StorybookService {

    private final StorybookRepository storybookRepository;
    private final StorybookSentenceRepository sentenceRepository;

    public void save(StorybookRequestDto dto) {
        // 1. 동화책 정보 저장
        Storybook storybook = storybookRepository.save(
                Storybook.builder()
                        .title(dto.getTitle()) // 책제목
                        .author(dto.getAuthor()) // 작가
                        .isbn(dto.getIsbn()) // ISBN
                        .publishedYear(dto.getPublishedYear()) // 출판년도
                        .publisher(dto.getPublisher()) // 출판사
                        .classification(dto.getClassification()) // 장르
                        .build()
        );
        // 2. 문단별 문장을 분리하여 저장
        for (StorybookRequestDto.ParagraphInfo paragraph : dto.getParagraphInfo()) { // ParagraphInfo 객체 리스트를 순회 paragraph 변수로 받고 사용
            List<String> sentences = splitSentences(paragraph.getSrcText());

            for (int i = 0; i < sentences.size(); i++) {
                StorybookSentence sentence = StorybookSentence.builder()
                        .storybook(storybook)
                        .srcTextId(paragraph.getSrcTextId())
                        .page(paragraph.getSrcPage())
                        .sentenceNumber(i + 1)  // 문장번호 1부터 시작
                        .sentence(sentences.get(i))
                        .build();

                sentenceRepository.save(sentence);
            }
        }
    }
    /**
     * 문단 텍스트를 문장 단위로 분리하는 메서드
     */
    private List<String> splitSentences(String text) {
        return Arrays.stream(text.split("(?<=[.!?。！？])\\s+")) // 마침표, 느낌표, 물음표 뒤 공백 기준 분리
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
