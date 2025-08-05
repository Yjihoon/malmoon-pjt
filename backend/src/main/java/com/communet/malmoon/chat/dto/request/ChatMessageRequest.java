package com.communet.malmoon.chat.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {
	private Long roomId;
	private Long senderId;
	private String content;
}
