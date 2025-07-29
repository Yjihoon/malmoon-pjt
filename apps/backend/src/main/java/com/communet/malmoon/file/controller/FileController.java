package com.communet.malmoon.file.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.communet.malmoon.file.domain.FileType;
import com.communet.malmoon.file.dto.response.FileUploadRes;
import com.communet.malmoon.file.service.FileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 파일 업로드 관련 API 컨트롤러입니다.
 * 이미지, 음성 등의 미디어 파일을 S3에 업로드하고, 업로드된 파일의 URL을 반환합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/files")
@Slf4j
@Tag(name = "파일", description = "S3 파일 업로드 API")
public class FileController {

	private final FileService fileService;

	/**
	 * 파일 업로드 API
	 *
	 * @param type 업로드할 파일의 유형 (예: AAC, PROFILE, REPORT)
	 * @param file 클라이언트가 업로드하는 파일 (Multipart 형식)
	 * @return 업로드된 S3 파일의 URL
	 */
	@Operation(
		summary = "S3 파일 업로드",
		description = "파일 유형과 Multipart 파일을 받아 AWS S3에 업로드하고, 업로드된 파일의 URL을 반환합니다."
	)
	@PostMapping("/upload/{type}")
	public ResponseEntity<FileUploadRes> uploadFile(
		@Parameter(description = "파일 유형 (예: AAC, PROFILE, REPORT)", example = "AAC")
		@PathVariable("type") FileType type,

		@Parameter(description = "업로드할 파일 (Multipart)", required = true)
		@RequestPart MultipartFile file
	) {
		try {
			FileUploadRes response = fileService.uploadFile(type.getDirectory(), file);
			log.info("업로드된 파일 URL: {}", response);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			log.error("파일 업로드 실패 - type: {}, filename: {}, 이유: {}", type, file.getOriginalFilename(), e.getMessage(),
				e);
			return ResponseEntity.internalServerError().build();
		}
	}
}
