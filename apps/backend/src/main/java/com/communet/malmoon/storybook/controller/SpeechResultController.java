package com.communet.malmoon.storybook.controller;

import com.communet.malmoon.storybook.service.SpeechResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/speech")
public class SpeechResultController {

    private final SpeechResultService speechResultService;

    @PostMapping
    public ResponseEntity<Void> uploadAudio(@RequestParam Long childId,
                                            @RequestParam Long sentenceId,
                                            @RequestParam String srcTextId,
                                            @RequestParam int page,
                                            @RequestParam MultipartFile audioFile) throws Exception {
        speechResultService.handleSpeechUpload(childId, sentenceId, srcTextId, page, audioFile);
        return ResponseEntity.ok().build();
    }
}
