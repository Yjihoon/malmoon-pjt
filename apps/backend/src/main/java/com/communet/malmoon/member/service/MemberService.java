package com.communet.malmoon.member.service;

import org.springframework.stereotype.Service;

import com.communet.malmoon.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

	private final MemberRepository memberRepository;

	public boolean checkEmail(String email) {
		return memberRepository.existsByEmail(email);
	}
}
