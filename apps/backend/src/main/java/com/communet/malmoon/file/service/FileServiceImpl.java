package com.communet.malmoon.file.service;

import org.springframework.stereotype.Service;

@Service
public class FileServiceImpl implements FileService {
	@Override
	public String getFileUrl(Long fileId) {
		// S3에서 presigned URL 생성하는 로직 또는 DB에서 파일 정보 조회
		return "https://s3.../file/" + fileId; // 예시
	}
}
