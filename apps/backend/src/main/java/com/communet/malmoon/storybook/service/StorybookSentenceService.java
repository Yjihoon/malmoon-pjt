package com.communet.malmoon.storybook.service;

// 장르, 책제목, 페이지에 따라 문장번호 순서대로 문장 응답해주는 로직


import com.communet.malmoon.storybook.dto.ClassificationListResponseDto;
import com.communet.malmoon.storybook.repository.StorybookRepository;
import com.communet.malmoon.storybook.repository.StorybookSentenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class StorybookSentenceService {

    private final StorybookRepository storybookRepository;
    private final StorybookSentenceRepository sentenceRepository;

    // 책 카테고리 응답 로직 처리
    public ClassificationListResponseDto getAllClassifications() {
        return new ClassificationListResponseDto(storybookRepository.findDistinctClassifications());
    }
}
