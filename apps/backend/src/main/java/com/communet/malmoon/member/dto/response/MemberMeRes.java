package com.communet.malmoon.member.dto.response;

import java.time.LocalDate;
import java.util.List;

import com.communet.malmoon.member.domain.Career;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class MemberMeRes {
	private String email;
	private String name;
	private String nickname;
	private LocalDate birthDate;
	private String tel1;
	private String tel2;
	private List<CareerRes> careers;
}
