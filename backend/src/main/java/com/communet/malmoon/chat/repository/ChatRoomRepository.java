package com.communet.malmoon.chat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.communet.malmoon.chat.domain.ChatRoom;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

	/**
	 * 치료 세션 기반 채팅: sessionId로 채팅방 조회
	 */
	Optional<ChatRoom> findBySessionId(Long sessionId);

	/**
	 * 채팅방 ID로 활성 상태의 채팅방 조회
	 */
	Optional<ChatRoom> findByRoomIdAndIsActiveTrue(Long roomId);

	/**
	 * 일반 1:1 채팅: title로 채팅방 조회
	 * (title은 두 사용자 ID 또는 username 조합으로 생성됨)
	 */
	Optional<ChatRoom> findByTitle(String title);
}
