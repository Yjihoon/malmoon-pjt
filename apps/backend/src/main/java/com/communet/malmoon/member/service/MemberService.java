package com.communet.malmoon.member.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.communet.malmoon.member.domain.Career;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.domain.MemberStatusType;
import com.communet.malmoon.member.domain.MemberType;
import com.communet.malmoon.member.domain.Therapist;
import com.communet.malmoon.member.dto.request.MemberJoinReq;
import com.communet.malmoon.member.dto.request.MemberMeChangeReq;
import com.communet.malmoon.member.dto.request.MemberPasswordChangeReq;
import com.communet.malmoon.member.dto.request.TherapistJoinReq;
import com.communet.malmoon.member.dto.response.MemberMeRes;
import com.communet.malmoon.member.exception.DuplicateEmailException;
import com.communet.malmoon.member.repository.CareerRepository;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.member.repository.TherapistRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

	private final MemberRepository memberRepository;
	private final TherapistRepository therapistRepository;
	private final CareerRepository careerRepository;
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
			.therapistId(member.getMemberId())
			.careerYears(therapistJoinReq.getCareerYears())
			//.qualificationImage()
			.careers(therapistJoinReq.getCareers())
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

	public MemberMeRes getMe(Member member) {
		if (member.getRole() == MemberType.ROLE_CLIENT) {
			return MemberMeRes.builder()
				.email(member.getEmail())
				.name(member.getName())
				.nickname(member.getNickname())
				.birthDate(member.getBirthDate())
				.tel1(member.getTel1())
				.tel2(member.getTel2())
				.build();
		}
		return MemberMeRes.builder()
			.email(member.getEmail())
			.name(member.getName())
			.nickname(member.getNickname())
			.birthDate(member.getBirthDate())
			.tel1(member.getTel1())
			.tel2(member.getTel2())
			.careers(careerRepository.findByTherapist_TherapistId(member.getMemberId()))
			.build();
	}

	public void changeMe(MemberMeChangeReq memberMeChangeReq, Member member) {
		if (memberMeChangeReq.getNickname() != null) {
			member.setNickname(memberMeChangeReq.getNickname());
		}
		if (memberMeChangeReq.getTel1() != null) {
			member.setTel1(memberMeChangeReq.getTel1());
		}
		if (memberMeChangeReq.getTel2() != null) {
			member.setTel2(memberMeChangeReq.getTel2());
		}
		// if (memberMeChangeReq.getProfileImageUrl() != null) {
		// 	member.setProfileImageUrl(memberMeChangeReq.getProfileImageUrl());
		// }
		if (memberMeChangeReq.getCareers() != null) {
			Therapist therapist = therapistRepository.findById(member.getMemberId())
				.orElseThrow(() -> new IllegalArgumentException("일반 회원은 경력을 수정할 수 없습니다."));

			List<Career> existingCareers = therapist.getCareers();
			existingCareers.addAll(memberMeChangeReq.getCareers());
		}

		memberRepository.save(member);
	}

	public void changePassword(MemberPasswordChangeReq req, Member member) {
		// 현재 비밀번호 확인
		if (!passwordEncoder.matches(req.getCurrentPassword(), member.getPassword())) {
			throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
		}

		// 같은 비밀번호로 변경 시도 방지
		if (passwordEncoder.matches(req.getNewPassword(), member.getPassword())) {
			throw new IllegalArgumentException("기존과 동일한 비밀번호로 변경할 수 없습니다.");
		}

		// 새 비밀번호 암호화 후 저장
		String encodedNewPassword = passwordEncoder.encode(req.getNewPassword());
		member.setPassword(encodedNewPassword);
		memberRepository.save(member);
	}
}
