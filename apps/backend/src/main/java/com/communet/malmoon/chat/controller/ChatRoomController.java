package com.communet.malmoon.chat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.chat.dto.request.ChatRoomCreateReq;
import com.communet.malmoon.chat.dto.response.ChatRoomCreateRes;
import com.communet.malmoon.chat.service.ChatRoomService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chat/room")
@RequiredArgsConstructor
@Tag(name = "chatRoom", description = "채팅방 관리 API")
public class ChatRoomController {
	private final ChatRoomService chatRoomService;

	@Operation(summary = "채팅방 생성", description = "1:1 또는 그룹 채팅방을 생성합니다.")
	@PostMapping
	public ResponseEntity<ChatRoomCreateRes> createRoom(@RequestBody ChatRoomCreateReq request) {
		ChatRoomCreateRes response = chatRoomService.createOrGetRoom(request);
		return ResponseEntity.ok(response);
	}
}
