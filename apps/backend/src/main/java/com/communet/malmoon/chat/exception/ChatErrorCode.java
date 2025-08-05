package com.communet.malmoon.chat.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Chat 도메인의 에러 코드 정의 enum
 */
@Getter
@RequiredArgsConstructor
public enum ChatErrorCode {
	INVALID_ROOM_ID(HttpStatus.NOT_FOUND, "유효하지 않은 채팅방 ID입니다."),
	REDIS_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "메시지를 Redis에 저장하는 데 실패했습니다."),
	DB_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "메시지를 DB에 저장하는 데 실패했습니다."),
	MESSAGE_EMPTY(HttpStatus.BAD_REQUEST, "메시지 내용이 비어 있습니다.");

	private final HttpStatus status;
	private final String message;
}
