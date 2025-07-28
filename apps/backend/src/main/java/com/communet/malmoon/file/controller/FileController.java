package com.communet.malmoon.file.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.communet.malmoon.file.domain.FileType;
import com.communet.malmoon.file.service.FileService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 파일 업로드 API 컨트롤러
 * - 이미지, 음성 등 미디어 파일을 S3에 업로드하고 URL을 반환한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/files")
@Slf4j
public class FileController {

	private final FileService fileService;

	/**
	 * 파일 업로드
	 *
	 * @param file MultipartFile 업로드할 파일 (이미지 또는 음성)
	 * @return 업로드된 S3 URL
	 */
	@Operation(summary = "S3 파일 업로드", description = "업로드 디렉토리와 파일을 받아 AWS S3에 업로드합니다.")
	@PostMapping("/upload/{type}")
	public ResponseEntity<String> uploadFile(@PathVariable("type") FileType type, @RequestPart MultipartFile file) {
		try {
			String uploadedUrl = fileService.uploadFile(type.getDirectory(), file);
			log.info("업로드된 파일 URL: {}", uploadedUrl);
			return ResponseEntity.ok(uploadedUrl);
		} catch (Exception e) {
			log.error("파일 업로드 실패 : {}", e.getMessage(), e);
			return ResponseEntity.internalServerError().body("파일 업로드 중 오류가 발생했습니다.");
		}
	}
}
