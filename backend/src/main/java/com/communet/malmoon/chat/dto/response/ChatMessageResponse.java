package com.communet.malmoon.chat.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatMessageResponse {
	private Long messageId;
	private Long roomId;
	private Long senderId;
	private String content;
	private LocalDateTime sendAt;
}
