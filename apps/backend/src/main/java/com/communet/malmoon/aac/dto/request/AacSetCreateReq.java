package com.communet.malmoon.aac.dto.request;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

/**
 * AAC 묶음 생성 요청 DTO
 */
@Getter
@Schema(description = "AAC 묶음 생성 요청 DTO")
public class AacSetCreateReq {

	@Schema(description = "AAC 묶음 이름", example = "기초 감정 표현")
	private String name;

	@Schema(description = "묶음에 포함할 AAC 카드 ID 목록", example = "[1, 2, 3]")
	private List<Long> aacIds;
}
