package com.communet.malmoon.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TherapistJoinReq extends MemberJoinReq {
	@NotBlank(message = "자격증 등록은 필수입니다.")
	private String qualification;
	@NotNull(message = "경력 입력은 필수입니다.")
	private Integer careerYears;
}
