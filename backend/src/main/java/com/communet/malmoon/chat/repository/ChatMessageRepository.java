package com.communet.malmoon.chat.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.communet.malmoon.chat.domain.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	// 특정 채팅방 메시지를 페이징으로 조회 (정렬은 Pageable에서 처리)
	Page<ChatMessage> findByRoomId(Long roomId, Pageable pageable);
	
	// 최근 메시지 1개 조회
	Optional<ChatMessage> findTop1ByRoomIdOrderBySentAtDesc(Long roomId);

}
