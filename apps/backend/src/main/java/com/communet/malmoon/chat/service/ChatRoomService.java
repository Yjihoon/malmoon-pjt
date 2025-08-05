package com.communet.malmoon.chat.service;

import com.communet.malmoon.chat.dto.request.ChatRoomCreateReq;
import com.communet.malmoon.chat.dto.response.ChatRoomCreateRes;

/**
 * 채팅방 관련 서비스 인터페이스
 */
public interface ChatRoomService {
	/**
	 * 채팅방 생성 또는 조회
	 * @param request 채팅방 생성 요청
	 * @return 생성된 채팅방 정보
	 */
	ChatRoomCreateRes createOrGetRoom(ChatRoomCreateReq request);

	void deleteSessionRoom(Long chatRoomId);
}
