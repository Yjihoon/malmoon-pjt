package com.communet.malmoon.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import lombok.extern.slf4j.Slf4j;

/**
 * 전역 예외 처리기
 * 모든 예외를 가로채고 일관된 에러 응답을 제공합니다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	/**
	 * 잘못된 인자 예외 처리
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorRes> handleIllegalArgument(IllegalArgumentException e, WebRequest request) {
		log.warn("IllegalArgumentException: {}", e.getMessage());
		return ResponseEntity.badRequest()
			.body(ExceptionResponseUtils.build(HttpStatus.BAD_REQUEST, e.getMessage(), request));
	}

	/**
	 * 그 외 모든 예외 처리
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorRes> handleAllExceptions(Exception e, WebRequest request) {
		log.error("Unhandled Exception: {}", e.getMessage(), e);
		return ResponseEntity.internalServerError()
			.body(ExceptionResponseUtils.build(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.", request));
	}
}
