package com.communet.malmoon.member.dto.response;

import lombok.Getter;

@Getter
public class MemberLoginRes {
	private final String accessToken;

	public MemberLoginRes(String accessToken) {
		this.accessToken = accessToken;
	}
}
