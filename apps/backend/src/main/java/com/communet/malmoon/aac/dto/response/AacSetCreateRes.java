package com.communet.malmoon.aac.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

/**
 * AAC 묶음 생성 응답 DTO
 */
@Getter
@Builder
@Schema(description = "AAC 묶음 생성 응답 DTO")
public class AacSetCreateRes {
	@Schema(description = "생성된 AAC 묶음 ID", example = "5")
	private Long setId;
}
