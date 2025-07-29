package com.communet.malmoon.member.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.dto.request.MemberLoginReq;
import com.communet.malmoon.member.jwt.util.JwtTokenUtil;
import com.communet.malmoon.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;

	public String login(MemberLoginReq memberLoginReq) {

		Member member = memberRepository.getByEmail(memberLoginReq.getEmail())
			.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		if (!passwordEncoder.matches(memberLoginReq.getPassword(), member.getPassword())) {
			throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
		}

		return JwtTokenUtil.getToken(member.getEmail(), member.getRole());
	}
}
