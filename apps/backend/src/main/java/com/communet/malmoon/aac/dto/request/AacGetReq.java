package com.communet.malmoon.aac.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AAC 목록 조회 요청 DTO입니다.
 *
 * @param situation 필터링할 상황 키워드 (선택)
 * @param action 필터링할 행동 키워드 (선택)
 * @param emotion 감정 필터링 키워드 (선택)
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지당 개수
 */
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AacGetReq {

	private String situation;
	private String action;
	private String emotion;

	private int page;
	private int size;
}
