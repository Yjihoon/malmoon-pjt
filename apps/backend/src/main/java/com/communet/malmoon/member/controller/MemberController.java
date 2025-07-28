package com.communet.malmoon.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.member.dto.request.MemberJoinReq;
import com.communet.malmoon.member.dto.request.TherapistJoinReq;
import com.communet.malmoon.member.service.MemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class MemberController {

	private final MemberService memberService;

	@PostMapping("/members")
	public ResponseEntity<?> join(@RequestBody @Valid MemberJoinReq memberJoinReq) {
		memberService.join(memberJoinReq);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@PostMapping("/therapists")
	public ResponseEntity<?> joinTherapist(@RequestBody @Valid TherapistJoinReq therapistJoinReq) {
		memberService.joinTherapist(therapistJoinReq);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
}
