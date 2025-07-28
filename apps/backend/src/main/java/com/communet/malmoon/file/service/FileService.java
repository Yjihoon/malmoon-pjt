package com.communet.malmoon.file.service;

/**
 * 파일 관련 기능을 정의하는 인터페이스입니다.
 */
public interface FileService {
	/**
	 * 파일 ID를 통해 S3에서 접근 가능한 URL을 반환합니다.
	 *
	 * @param fileId 파일 식별자
	 * @return 이미지 URL
	 */
	String getFileUrl(Long fileId);
}
