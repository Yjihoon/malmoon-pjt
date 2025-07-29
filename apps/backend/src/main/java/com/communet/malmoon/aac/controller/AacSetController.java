package com.communet.malmoon.aac.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.aac.dto.request.AacSetCreateReq;
import com.communet.malmoon.aac.dto.response.AacSetCreateRes;
import com.communet.malmoon.aac.service.AacSetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AAC 묶음 관련 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping()
@Slf4j
@Tag(name = "AAC 묶음", description = "AAC 카드 묶음 CRUD API")
public class AacSetController {

	private final AacSetService aacSetService;

	/**
	 * AAC 묶음을 생성합니다.
	 *
	 * @param request 묶음 이름과 포함할 AAC 카드 ID 목록
	 * @param principal 로그인한 사용자 정보
	 * @return 생성된 AAC 묶음 ID
	 */
	@Operation(
		summary = "AAC 묶음 생성",
		description = "여러 AAC 카드들을 하나의 묶음으로 생성합니다.",
		requestBody = @RequestBody(
			description = "묶음 이름과 포함할 AAC 카드 ID 리스트",
			required = true,
			content = @Content(
				schema = @Schema(implementation = AacSetCreateReq.class)
			)
		)
	)
	public ResponseEntity<AacSetCreateRes> createAacSet(
		@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "AAC 묶음 생성 요청 객체", required = true)
		@org.springframework.web.bind.annotation.RequestBody AacSetCreateReq request,

		@Parameter(hidden = true)
		@AuthenticationPrincipal CustomMemberPrincipal principal) {

	}
}
