package com.communet.malmoon.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChatRoomSessionCreateReq extends ChatRoomCreateReq {
	private String sessionId;
}
