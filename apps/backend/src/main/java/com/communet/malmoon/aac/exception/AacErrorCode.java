package com.communet.malmoon.aac.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * AAC 관련 에러 코드 정의
 */
@Getter
@RequiredArgsConstructor
public enum AacErrorCode {
	INVALID_AAC_ID(HttpStatus.BAD_REQUEST, "유효하지 않은 AAC ID입니다."),
	NOT_FOUND(HttpStatus.NOT_FOUND, "AAC 정보를 찾을 수 없습니다."),
	FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다."),
	UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "해당 AAC에 접근 권한이 없습니다."),
	GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AAC 이미지 생성에 실패했습니다.");

	private final HttpStatus status;
	private final String message;
}
