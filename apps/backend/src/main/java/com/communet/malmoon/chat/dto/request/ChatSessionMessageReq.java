package com.communet.malmoon.chat.dto.request;

import lombok.Data;

@Data
public class ChatSessionMessageReq extends ChatMessageReq {
	private String sessionId;
}
