package com.communet.malmoon.chat.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.communet.malmoon.chat.domain.ChatMessage;
import com.communet.malmoon.chat.dto.request.ChatMessageRequest;
import com.communet.malmoon.chat.dto.response.ChatMessageResponse;
import com.communet.malmoon.chat.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

/**
 * 채팅 메시지 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

	private final ChatMessageRepository chatMessageRepository;

	/**
	 * 특정 채팅방의 메시지를 오래된 순으로 페이지 단위로 조회합니다.
	 *
	 * @param roomId 채팅방 ID
	 * @param page 페이지 번호 (0부터 시작)
	 * @param size 페이지당 메시지 수
	 * @return 페이지 단위의 ChatMessageResponse 목록
	 */
	public Page<ChatMessageResponse> getMessageAsc(Long roomId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("sentAt").ascending());
		return chatMessageRepository.findByRoomId(roomId, pageable)
			.map(this::toResponse);
	}

	/**
	 * 특정 채팅방의 가장 최근 메시지를 조회합니다.
	 *
	 * @param roomId 채팅방 ID
	 * @return 가장 최근 메시지의 ChatMessageResponse
	 * @throws IllegalArgumentException 메시지가 없는 경우
	 */
	public ChatMessageResponse getLatestMessage(Long roomId) {
		ChatMessage message = chatMessageRepository.findTop1ByRoomIdOrderBySentAtDesc(roomId)
			.orElseThrow(() -> new IllegalArgumentException("최근 메시지가 없습니다."));
		return toResponse(message);
	}

	/**
	 * 채팅 메시지를 저장하고 응답 DTO로 반환합니다.
	 *
	 * @param request 저장할 메시지 요청 객체
	 * @return 저장된 메시지의 ChatMessageResponse
	 */
	@Transactional
	public ChatMessageResponse saveMessage(ChatMessageRequest request) {
		ChatMessage message = ChatMessage.builder()
			.rommId(request.getRoomId())
			.senderId(request.getSenderId())
			.content(request.getContent())
			.build();
		ChatMessage saved = chatMessageRepository.save(message);
		return toResponse(saved);
	}

	/**
	 * ChatMessage 엔티티를 ChatMessageResponse DTO로 변환합니다.
	 *
	 * @param message 변환할 메시지 엔티티
	 * @return 변환된 응답 DTO
	 */
	private ChatMessageResponse toResponse(ChatMessage message) {
		return ChatMessageResponse.builder()
			.messageId(message.getMessageId())
			.roomId(message.getRommId())
			.senderId(message.getSenderId())
			.content(message.getContent())
			.sendAt(message.getSentAt())
			.build();
	}
}
