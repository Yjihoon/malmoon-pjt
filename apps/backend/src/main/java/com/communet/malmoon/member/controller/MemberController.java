package com.communet.malmoon.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.communet.malmoon.common.auth.CurrentMember;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.dto.request.MemberJoinReq;
import com.communet.malmoon.member.dto.request.MemberMeChangeReq;
import com.communet.malmoon.member.dto.request.MemberPasswordChangeReq;
import com.communet.malmoon.member.dto.request.TherapistJoinReq;
import com.communet.malmoon.member.dto.response.MemberEmailRes;
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

	@DeleteMapping("/members")
	public ResponseEntity<?> withdraw(@CurrentMember Member member) {
		memberService.withdraw(member);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/members/email")
	public ResponseEntity<?> checkEmail(@RequestParam String email) {
		boolean exists = memberService.checkEmail(email);
		return ResponseEntity.ok(new MemberEmailRes(exists));
	}

	@GetMapping("/members/me")
	public ResponseEntity<?> getMe(@CurrentMember Member member) {
		return ResponseEntity.ok(memberService.getMe(member));
	}

	@PatchMapping("/members/me")
	public ResponseEntity<?> changeMe(MemberMeChangeReq memberMeChangeReq, @CurrentMember Member member) {
		memberService.changeMe(memberMeChangeReq, member);
		return ResponseEntity.ok().build();
	}

	@PatchMapping("/members/me/password")
	public ResponseEntity<?> changePassword(
		@RequestBody @Valid MemberPasswordChangeReq req,
		@CurrentMember Member member
	) {
		memberService.changePassword(req, member);
		return ResponseEntity.ok().build();
	}
}
