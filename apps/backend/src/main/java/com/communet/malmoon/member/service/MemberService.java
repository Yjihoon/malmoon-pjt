package com.communet.malmoon.member.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.domain.MemberStatusType;
import com.communet.malmoon.member.domain.MemberType;
import com.communet.malmoon.member.domain.Therapist;
import com.communet.malmoon.member.dto.request.MemberJoinReq;
import com.communet.malmoon.member.dto.request.TherapistJoinReq;
import com.communet.malmoon.member.exception.DuplicateEmailException;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.member.repository.TherapistRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

	private final MemberRepository memberRepository;
	private final TherapistRepository therapistRepository;
	private final PasswordEncoder passwordEncoder;

	public void join(MemberJoinReq memberJoinReq) {
		if (checkEmail(memberJoinReq.getEmail())) {
			throw new DuplicateEmailException("이미 사용 중인 이메일입니다.");
		}
		Member member = Member.builder()
			.email(memberJoinReq.getEmail())
			.password(passwordEncoder.encode(memberJoinReq.getPassword()))
			.name(memberJoinReq.getName())
			.nickname(memberJoinReq.getNickname())
			.birthDate(memberJoinReq.getBirthDate())
			.tel1(memberJoinReq.getTel1())
			.tel2(memberJoinReq.getTel2())
			.role(MemberType.ROLE_CLIENT)
			.status(MemberStatusType.ACTIVE)
			.build();

		memberRepository.save(member);
	}

	@Transactional
	public void joinTherapist(TherapistJoinReq therapistJoinReq) {
		if (checkEmail(therapistJoinReq.getEmail())) {
			throw new DuplicateEmailException("이미 사용 중인 이메일입니다.");
		}

		Member member = Member.builder()
			.email(therapistJoinReq.getEmail())
			.password(passwordEncoder.encode(therapistJoinReq.getPassword()))
			.name(therapistJoinReq.getName())
			.nickname(therapistJoinReq.getNickname())
			.birthDate(therapistJoinReq.getBirthDate())
			.tel1(therapistJoinReq.getTel1())
			.tel2(therapistJoinReq.getTel2())
			.role(MemberType.ROLE_THERAPIST)
			.status(MemberStatusType.ACTIVE)
			.build();

		memberRepository.save(member);

		Therapist therapist = Therapist.builder()
			.therapist_id(member.getMemberId())
			.careerYears(therapistJoinReq.getCareerYears())
			//.qualificationImage()
			.build();

		therapistRepository.save(therapist);
	}

	public boolean checkEmail(String email) {
		return memberRepository.existsByEmail(email);
	}

	@Transactional
	public void withdraw(Member member) {
		member.setStatus(MemberStatusType.WITHDRAWN);
	}
}
