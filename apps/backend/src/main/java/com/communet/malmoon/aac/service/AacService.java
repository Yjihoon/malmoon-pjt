package com.communet.malmoon.aac.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.communet.malmoon.aac.domain.Aac;
import com.communet.malmoon.aac.dto.request.AacCreateReq;
import com.communet.malmoon.aac.dto.request.AacGetReq;
import com.communet.malmoon.aac.dto.response.AacGetRes;
import com.communet.malmoon.aac.exception.AacErrorCode;
import com.communet.malmoon.aac.exception.AacException;
import com.communet.malmoon.aac.repository.AacRepository;
import com.communet.malmoon.aac.repository.AacSpecification;
import com.communet.malmoon.external.fastapi.FastApiClient;
import com.communet.malmoon.file.service.FileService;

import lombok.RequiredArgsConstructor;

/**
 * AAC 관련 비즈니스 로직을 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
public class AacService {

	private final AacRepository aacRepository;
	private final FileService fileService;
	private final FastApiClient fastApiClient;

	/**
	 * 필터 조건과 페이징 정보를 기반으로 DEFAULT 또는 PUBLIC 상태의 AAC 항목을 조회합니다.
	 * 각 항목에는 S3 이미지 URL이 포함되어 반환됩니다.
	 *
	 * @param req 필터 조건 (situation, action, emotion) 및 페이지 정보
	 * @return 조건에 맞는 AAC 항목 페이지 (이미지 URL 포함)
	 */
	public Page<AacGetRes> getAacList(AacGetReq req) {
		Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
		// 동적 필터 조건 구성
		var spec = AacSpecification.withFilters(req.getSituation(), req.getAction(), req.getEmotion());

		// Specification 기반 조회
		Page<Aac> page = aacRepository.findAll(spec, pageable);

		// 파일 URL 포함하여 응답 객체로 변환
		return page.map(aac -> {
			try {
				String imageUrl = fileService.getFileUrl(aac.getFileId());
				return AacGetRes.from(aac, imageUrl);
			} catch (Exception e) {
				throw new AacException(AacErrorCode.NOT_FOUND);
			}
		});
	}

	/**
	 * FastAPI를 통해 이미지 프리뷰 생성 요청을 수행합니다.
	 *
	 * @param request AAC 생성 요청 데이터
	 * @return 생성된 이미지 preview URL
	 */
	public String requestPreviewFromFastApi(AacCreateReq request) {
		return fastApiClient.requestPreviewImage(request);
	}

}
