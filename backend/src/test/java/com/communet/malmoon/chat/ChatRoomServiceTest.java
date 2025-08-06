package com.communet.malmoon.chat;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.communet.malmoon.chat.domain.ChatRoom;
import com.communet.malmoon.chat.repository.ChatRoomRepository;
import com.communet.malmoon.chat.service.ChatRoomService;

@SpringBootTest
public class ChatRoomServiceTest {

	@Autowired
	private ChatRoomService chatRoomService;

	@Autowired
	private ChatRoomRepository chatRoomRepository;

	@Test
	void sessionId_기반_채팅방_생성_혹은_조회_테스트() {
		Long sessionId = 100L;

		ChatRoom room = chatRoomService.createOrGetBySession(sessionId);

		assertThat(room).isNotNull();
		assertThat(room.getSessionId()).isEqualTo(sessionId);
	}

}
