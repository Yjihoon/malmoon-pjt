package com.communet.malmoon.aac.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.communet.malmoon.aac.domain.Aac;
import com.communet.malmoon.aac.dto.request.AacGetReq;
import com.communet.malmoon.aac.dto.response.AacGetRes;
import com.communet.malmoon.aac.repository.AacRepository;
import com.communet.malmoon.aac.repository.AacSpecification;
import com.communet.malmoon.file.service.FileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AacService {

	private final AacRepository aacRepository;
	private final FileService fileService;

	/**
	 * DEFAULT, PUBLIC 상태인 AAC 목록을 조건과 페이징 기준으로 조회합니다.
	 *
	 * @param req 필터 및 페이지 조건
	 * @return 페이지 단위 AAC 응답 목록
	 */
	public Page<AacGetRes> getAacList(AacGetReq req) {
		Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
		// 동적 필터 조건 구성
		var spec = AacSpecification.withFilters(req.getSituation(), req.getAction(), req.getEmotion());

		// Specification 기반 조회
		Page<Aac> page = aacRepository.findAll(spec, pageable);

		// 파일 URL 포함하여 응답 객체로 변환
		return page.map(aac -> AacGetRes.from(aac, fileService.getFileUrl(aac.getFileId())));
	}
}
