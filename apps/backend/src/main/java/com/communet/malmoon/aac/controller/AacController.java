package com.communet.malmoon.aac.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.aac.dto.request.AacGetReq;
import com.communet.malmoon.aac.dto.response.AacGetRes;
import com.communet.malmoon.aac.service.AacService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AAC 관련 API 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/aacs")
@RequiredArgsConstructor
@Slf4j
public class AacController {

	private final AacService aacService;

	/**
	 * 로그인한 사용자만 접근 가능한 AAC 목록 조회 API입니다.
	 * DEFAULT, PUBLIC 상태의 항목만 반환합니다.
	 *
	 * @param req 상황, 감정 등 필터와 페이지 정보
	 * @return 필터 조건에 따른 AAC 목록
	 */
	@PreAuthorize("isAuthenticated()")
	@GetMapping
	public ResponseEntity<Page<AacGetRes>> getAacList(@ModelAttribute AacGetReq req) {
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
