package com.communet.malmoon.aac.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.aac.dto.request.AacGetReq;
import com.communet.malmoon.aac.dto.response.AacGetRes;
import com.communet.malmoon.aac.service.AacService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AAC 관련 API 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/aacs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AAC", description = "AAC 이모지 관련 API")
public class AacController {

	private final AacService aacService;

	/**
	 * 로그인한 사용자만 접근 가능한 AAC 목록 조회 API입니다.
	 * DEFAULT, PUBLIC 상태의 항목만 반환합니다.
	 *
	 * @param req 상황, 감정 등 필터와 페이지 정보
	 * @return 필터 조건에 따른 AAC 목록
	 */
	//@PreAuthorize("isAuthenticated()")
	@Operation(summary = "AAC 검색 및 목록 조회", description = "상황, 감정, 동작 조건을 전달하면 해당 조건에 맞는 AAC 이모지를 검색합니다. 조건이 없으면 전체 목록을 반환합니다.")
	@GetMapping
	public ResponseEntity<Page<AacGetRes>> getAacList(
		@Parameter(description = "AAC 필터 조건 및 페이징 정보") @ModelAttribute AacGetReq req) {
		try {
			log.info("AAC 목록 조회 요청: {}", req);
			Page<AacGetRes> result = aacService.getAacList(req);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			log.error("AAC 목록 조회 중 예외 발생: {}", e.getMessage(), e);
			return ResponseEntity.internalServerError().build();
		}
	}
}
