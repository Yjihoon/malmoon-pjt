package com.communet.malmoon.file.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.communet.malmoon.file.domain.File;
import com.communet.malmoon.file.domain.FileType;
import com.communet.malmoon.file.dto.response.FileUploadRes;
import com.communet.malmoon.file.repository.FileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 파일 서비스 구현체
 * - 파일 업로드 로직 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

	private final S3Uploader s3Uploader;
	private final FileRepository fileRepository;

	@Value("${cloud.aws.s3.url-prefix}")
	private String s3Prefix;

	@Override
	public FileUploadRes uploadFile(String directory, MultipartFile file) {
		try {
			// 1. S3에 파일 업로드 → 파일 경로만 반환됨 (예: aac/abc.png)
			String filename = s3Uploader.upload(directory, file);

			// 2. File 엔티티 생성 및 저장
			File savedFile = fileRepository.save(File.builder()
				.fileType(FileType.valueOf(directory.toUpperCase())) // directory → Enum 변환
				.filename(filename)
				.isDeleted(false)
				.build());

			log.info("파일 저장 완료: id={}, filename={}", savedFile.getId(), filename);

			// 3. 응답 DTO 반환
			return FileUploadRes.builder()
				.fileId(savedFile.getId())
				.url(s3Prefix + filename)
				.build();
			
		} catch (IOException e) {
			log.error("파일 업로드 실패", e);
			throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
		}
	}

	@Override
	public String getFileUrl(Long fileId) {
		File file = fileRepository.findById(fileId)
			.orElseThrow(() -> new IllegalArgumentException("해당 파일이 존재하지 않습니다. ID=" + fileId));

		if (file.isDeleted()) {
			throw new IllegalStateException("삭제된 파일입니다. ID=" + fileId);
		}

		return s3Prefix + file.getFilename();
	}
}
