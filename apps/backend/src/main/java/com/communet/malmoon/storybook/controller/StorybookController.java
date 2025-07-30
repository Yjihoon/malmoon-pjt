package com.communet.malmoon.storybook.controller;

import com.communet.malmoon.storybook.dto.ClassificationListResponseDto;
import com.communet.malmoon.storybook.service.StorybookSentenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/storybooks")
@RequiredArgsConstructor
public class StorybookController {

    private final StorybookSentenceService sentenceService;

    @GetMapping("/classifications")
    public ResponseEntity<ClassificationListResponseDto> getClassifications() {
        return ResponseEntity.ok(sentenceService.getAllClassifications());
    }
}
