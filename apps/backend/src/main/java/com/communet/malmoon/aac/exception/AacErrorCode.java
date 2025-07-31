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
	// === 공통 ===
	INVALID_AAC_ID(HttpStatus.BAD_REQUEST, "유효하지 않은 AAC ID입니다."),
	NOT_FOUND(HttpStatus.NOT_FOUND, "AAC 정보를 찾을 수 없습니다."),
	FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다."),
	UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "해당 AAC에 접근 권한이 없습니다."),
	GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AAC 이미지 생성에 실패했습니다."),

	// === FastAPI 연동 관련 ===
	FASTAPI_CLIENT_ERROR(HttpStatus.BAD_REQUEST, "FastAPI 요청이 잘못되었습니다."),
	FASTAPI_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI 서버 오류가 발생했습니다."),
	FASTAPI_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "FastAPI 응답 지연 또는 연결 실패입니다."),
	FASTAPI_INVALID_RESPONSE(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI로부터 잘못된 응답을 받았습니다."),

	// === 임시 이미지 처리 관련 ===
	TEMP_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "임시 이미지가 존재하지 않습니다."),
	TEMP_IMAGE_DELETE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "임시 이미지 삭제에 실패했습니다."),

	// === 저장 실패 관련 ===
	FILE_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "파일 정보 저장에 실패했습니다."),
	AAC_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AAC 정보 저장에 실패했습니다.");
	
	private final HttpStatus status;
	private final String message;
}
