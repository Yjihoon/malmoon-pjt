package com.communet.malmoon.storybook.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.communet.malmoon.storybook.service.SpeechResultService;

import lombok.RequiredArgsConstructor;

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
		//System.out.println("🟢 [Spring] 프론트에서 받은 파일 이름: " + audioFile.getOriginalFilename());
		//System.out.println("🟢 [Spring] 파일 크기(bytes): " + audioFile.getSize());

		// 1) 원본 확장자 유지
		String originalName = audioFile.getOriginalFilename();
		String ext = (originalName != null && originalName.lastIndexOf('.') != -1)
			? originalName.substring(originalName.lastIndexOf('.'))
			: ".bin";

		// 2) 안전한 임시 파일로 즉시 복사
		java.nio.file.Path temp = java.nio.file.Files.createTempFile("uploaded-", ext);
		audioFile.transferTo(temp.toFile());
		//System.out.println("🟢 [Spring] 안전 보관 경로: " + temp.toAbsolutePath());

		// 3) 서비스에는 MultipartFile 대신 '안전 경로' 또는 '바이트' 전달
		// 권장 A: 경로 전달
		speechResultService.handleSpeechUpload(childId, sentenceId, srcTextId, page, temp);
		return ResponseEntity.ok().build();
	}
}
