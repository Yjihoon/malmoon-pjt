package com.communet.malmoon.file.service;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

	@Override
	public String uploadFile(String directory, MultipartFile file) {
		try {
			return s3Uploader.upload(directory, file);
		} catch (IOException e) {
			log.error("파일 업로드 실패", e);
			throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
		}
	}
}
