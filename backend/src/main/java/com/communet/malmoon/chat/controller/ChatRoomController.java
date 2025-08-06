package com.communet.malmoon.chat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.chat.domain.ChatRoom;
import com.communet.malmoon.chat.service.ChatRoomService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/chat/rooms")
@RequiredArgsConstructor
@Slf4j
public class ChatRoomController {

	private final ChatRoomService chatRoomService;

	/**
	 * 치료 세션 기반 채팅방 생성 or 조회
	 * @param sessionId Redis에서 전달받은 sessionId
	 */
	@RequestMapping("/session/{sessionId}")
	public ResponseEntity<ChatRoom> createOrGetSessionRoom(@PathVariable Long sessionId) {
		try {
			ChatRoom chatRoom = chatRoomService.createOrGetBySession(sessionId);
			return ResponseEntity.ok(chatRoom);
		} catch (Exception e) {
			log.error("채팅방 생성 또는 조회 중 오류 발생 (sessionId : {})", sessionId, e);
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * 일반 1:1 채팅방 생성 or 조회 (title로 구분)
	 * @param title 채팅방 제목
	 */
	@PostMapping("/title")
	public ResponseEntity<ChatRoom> create1to1ChatRoom(@RequestParam String title) {
		try {
			ChatRoom chatRoom = chatRoomService.create1to1ChatRoom(title);
			return ResponseEntity.ok(chatRoom);
		} catch (Exception e) {
			log.error("1:1 채팅방 생성 실패 (title : {})", title, e);
			return ResponseEntity.internalServerError().build();
		}
	}
}
