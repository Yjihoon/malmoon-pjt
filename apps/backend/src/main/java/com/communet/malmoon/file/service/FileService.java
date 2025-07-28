package com.communet.malmoon.file.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 관련 기능을 정의하는 인터페이스입니다.
 */
public interface FileService {
	/**
	 * 파일 업로드
	 *
	 * @param directory 업로드 대상 디렉토리 (aac, profile 등)
	 * @param file MultipartFile 업로드할 파일
	 * @return 업로드된 S3 URL
	 */
	String uploadFile(String directory, MultipartFile file);
}
