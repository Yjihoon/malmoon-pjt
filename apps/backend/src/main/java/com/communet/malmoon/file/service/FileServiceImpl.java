package com.communet.malmoon.file.service;

import java.io.IOException;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.communet.malmoon.file.domain.File;
import com.communet.malmoon.file.domain.FileType;
import com.communet.malmoon.file.dto.response.FileUploadRes;
import com.communet.malmoon.file.repository.FileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

/**
 * 파일 서비스 구현체
 * - 파일 업로드 로직 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

	private final S3Presigner s3Presigner;
	private final S3Uploader s3Uploader;
	private final FileRepository fileRepository;

	@Value("${cloud.aws.s3.url-prefix}")
	private String s3Prefix;

	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

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
	public FileUploadRes uploadFile(String directory, java.io.File file) {
		try (java.io.InputStream inputStream = new java.io.FileInputStream(file)) {
			// 0. ContentType 추론
			String contentType = resolveContentType(file.getName());

			// 1. S3Uploader에 InputStream 기반 업로드 요청
			String filename = s3Uploader.upload(directory, inputStream, file.getName(), contentType);

			// 2. File 엔티티 저장
			File savedFile = fileRepository.save(File.builder()
				.fileType(FileType.valueOf(directory.toUpperCase()))
				.filename(filename)
				.isDeleted(false)
				.build());

			log.info("파일 저장 완료: id={}, filename={}", savedFile.getId(), filename);

			// 3. 결과 DTO 반환
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

	@Override
	public String getPresignedFileUrl(Long fileId) {
		File file = fileRepository.findById(fileId)
			.orElseThrow(() -> new IllegalArgumentException("해당 파일이 존재하지 않습니다. ID=" + fileId));

		if (file.isDeleted()) {
			throw new IllegalStateException("삭제된 파일입니다. ID=" + fileId);
		}

		String key = file.getFilename();

		GetObjectRequest getObjectRequest = GetObjectRequest.builder()
			.bucket(bucket)
			.key(key)
			.build();

		GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
			.signatureDuration(Duration.ofMinutes(10))
			.getObjectRequest(getObjectRequest)
			.build();

		PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
		return presignedRequest.url().toString();
	}

	private String resolveContentType(String filename) {
		filename = filename.toLowerCase();
		if (filename.endsWith(".png"))
			return "image/png";
		if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
			return "image/jpeg";
		if (filename.endsWith(".gif"))
			return "image/gif";
		return "application/octet-stream";
	}

}
