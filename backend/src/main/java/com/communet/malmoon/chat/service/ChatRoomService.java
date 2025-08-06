package com.communet.malmoon.chat.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.communet.malmoon.chat.domain.ChatRoom;
import com.communet.malmoon.chat.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

/**
 * 채팅방(ChatRoom)과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * - 치료 세션 기반 채팅방 생성 및 조회
 * - 일반 1:1 채팅방 생성
 * - 채팅방 조회 및 종료 처리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
	private final ChatRoomRepository chatRoomRepository;

	/**
	 * 치료 세션 기반 채팅방을 생성하거나 기존 채팅방을 조회합니다.
	 * Redis에서 전달받은 sessionId를 기반으로 처리됩니다.
	 *
	 * @param sessionIdFromRedis Redis에서 전달받은 치료 세션 ID
	 * @return 생성되었거나 기존에 존재하는 ChatRoom 객체
	 */
	@Transactional
	public ChatRoom createOrGetBySession(Long sessionIdFromRedis) {
		return chatRoomRepository.findBySessionId(sessionIdFromRedis)
			.orElseGet(() -> {
				ChatRoom room = ChatRoom.builder()
					.sessionId(sessionIdFromRedis)
					.isActive(true)
					.createdAt(LocalDateTime.now())
					.build();
				return chatRoomRepository.save(room);
			});
	}

	/**
	 * 일반적인 1:1 채팅방을 생성하거나, 이미 존재하는 경우 기존 방을 반환합니다.
	 * sessionId는 null이며, title(예: "user1-user2")로 유일하게 구분됩니다.
	 *
	 * @param title 1:1 채팅방 고유 식별용 title (사용자 ID 정렬 조합 등)
	 * @return ChatRoom 객체 (기존 또는 새로 생성된)
	 */
	@Transactional
	public ChatRoom create1to1ChatRoom(String title) {
		// 이미 동일 title의 채팅방이 존재하면 반환 (중복 생성 방지)
		return chatRoomRepository.findByTitle(title)
			.orElseGet(() -> {
				ChatRoom room = ChatRoom.builder()
					.sessionId(null)
					.title(title)
					.isActive(true)
					.createdAt(LocalDateTime.now())
					.build();
				return chatRoomRepository.save(room);
			});
	}

	/**
	 * 주어진 roomId에 해당하는 채팅방을 조회합니다.
	 *
	 * @param roomId 조회할 채팅방의 ID
	 * @return ChatRoom 객체
	 * @throws IllegalArgumentException 채팅방이 존재하지 않는 경우
	 */
	public ChatRoom getRoom(Long roomId) {
		return chatRoomRepository.findById(roomId)
			.orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));
	}

	/**
	 * 주어진 roomId에 해당하는 채팅방을 종료 처리합니다.
	 * isActive를 false로 설정하고 종료 시각(endedAt)을 기록합니다.
	 *
	 * @param roomId 종료할 채팅방의 ID
	 * @throws IllegalArgumentException 채팅방이 존재하지 않는 경우
	 */
	@Transactional
	public void closeChatRoom(Long roomId) {
		ChatRoom room = chatRoomRepository.findById(roomId)
			.orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));
		room.setIsActive(false);
		room.setEndedAt(LocalDateTime.now());
	}

}
