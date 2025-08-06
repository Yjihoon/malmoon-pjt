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
                                            @RequestParam MultipartFile audioFile) throws IOException {

        // ✅ [1단계] 파일 이름과 크기 확인
        System.out.println("🟢 [Spring] 프론트에서 받은 파일 이름: " + audioFile.getOriginalFilename());
        System.out.println("🟢 [Spring] 파일 크기(bytes): " + audioFile.getSize());

        // ✅ [1단계] 파일 임시 저장 경로 확인 (필요 시)
        java.nio.file.Path temp = java.nio.file.Files.createTempFile("uploaded-", ".mp3");
        audioFile.transferTo(temp.toFile());
        System.out.println("🟢 [Spring] 파일 임시 저장 경로: " + temp.toAbsolutePath());
        
        // 실제 서비스 호출
        speechResultService.handleSpeechUpload(childId, sentenceId, srcTextId, page, audioFile);
        return ResponseEntity.ok().build();
    }
}
