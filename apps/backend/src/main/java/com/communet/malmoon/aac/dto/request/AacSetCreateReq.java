package com.communet.malmoon.aac.dto.request;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * AAC 묶음 생성 요청 DTO
 */
@Data
@Schema(description = "AAC 묶음 생성 요청 DTO")
public class AacSetCreateReq {

	@Schema(description = "묶음 이름", example = "긴급 상황용 AAC")
	private String name;

	@Schema(description = "묶음 설명", example = "응급 시 사용할 AAC 묶음")
	private String description;

	@Schema(description = "AAC 항목 ID 리스트 (선택 순서)", example = "[3, 1, 4]")
	private List<Long> aacItemIds;
}
