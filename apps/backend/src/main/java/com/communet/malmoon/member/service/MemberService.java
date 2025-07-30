package com.communet.malmoon.member.service;

import java.util.ArrayList;
import java.util.List;

import com.communet.malmoon.member.dto.request.*;
import com.communet.malmoon.member.dto.response.CareerRes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.communet.malmoon.member.domain.Career;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.domain.MemberStatusType;
import com.communet.malmoon.member.domain.MemberType;
import com.communet.malmoon.member.domain.Therapist;
import com.communet.malmoon.member.dto.response.MemberMeRes;
import com.communet.malmoon.member.exception.DuplicateEmailException;
import com.communet.malmoon.member.repository.CareerRepository;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.member.repository.TherapistRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

	private final MemberRepository memberRepository;
	private final TherapistRepository therapistRepository;
	private final CareerRepository careerRepository;
	private final PasswordEncoder passwordEncoder;

	/**
	 * 일반 회원 가입 처리
	 * 1. 이메일 중복 검사
	 * 2. 비밀번호 암호화
	 * 3. 회원 엔티티 생성 및 저장
	 * @param memberJoinReq 회원 가입 요청 DTO
	 * @throws DuplicateEmailException 이메일 중복 시 예외 발생
	 */
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

	/**
	 * 치료사 회원 가입 처리 (트랜잭션 적용)
	 * 1. 이메일 중복 검사
	 * 2. 비밀번호 암호화
	 * 3. 회원 엔티티 저장
	 * 4. 치료사 엔티티 생성 및 저장
	 * @param therapistJoinReq 치료사 가입 요청 DTO
	 * @throws DuplicateEmailException 이메일 중복 시 예외 발생
	 */
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
				.build();

		therapistRepository.save(therapist);
		for (Career career : therapistJoinReq.getCareers()) {
			career.setTherapist(therapist);
		}
        careerRepository.saveAll(therapistJoinReq.getCareers());
	}

	/**
	 * 이메일 중복 체크
	 * @param email 체크할 이메일
	 * @return 이미 존재하면 true, 아니면 false
	 */
	public boolean checkEmail(String email) {
		return memberRepository.existsByEmail(email);
	}

	/**
	 * 회원 탈퇴 처리 (상태값 변경)
	 * @param member 탈퇴할 회원 엔티티
	 */
	@Transactional
	public void withdraw(Member member) {
		member.setStatus(MemberStatusType.WITHDRAWN);
	}

	/**
	 * 내 정보 조회
	 * - 일반 회원과 치료사 정보를 구분하여 반환
	 * @param member 현재 로그인한 회원
	 * @return 회원 상세 정보 응답 DTO
	 */
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

		List<Career> careers = careerRepository.findByTherapist_TherapistId(member.getMemberId());
		List<CareerRes> careerResList = careers.stream()
				.map(c -> CareerRes.builder()
						.careerId(c.getCareerId())
						.company(c.getCompany())
						.position(c.getPosition())
						.startDate(c.getStartDate())
						.endDate((c.getEndDate()))
						.build())
				.toList();

		return MemberMeRes.builder()
			.email(member.getEmail())
			.name(member.getName())
			.nickname(member.getNickname())
			.birthDate(member.getBirthDate())
			.tel1(member.getTel1())
			.tel2(member.getTel2())
			.careers(careerResList)
			.build();
	}

	/**
	 * 내 정보 수정
	 * - 닉네임, 전화번호 등 변경 가능
	 * - 치료사 경력 추가 시 처리
	 * @param memberMeChangeReq 수정할 정보 DTO
	 * @param memberArg 현재 로그인한 회원
	 * @throws IllegalArgumentException 일반 회원이 경력을 수정하려 할 경우 발생
	 */
	@Transactional
	public void changeMe(MemberMeChangeReq memberMeChangeReq, Member memberArg) {

		Member member = memberRepository.findById(memberArg.getMemberId())
				.orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

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

			careerRepository.deleteByTherapist_TherapistId(member.getMemberId());
			List<Career> careers = new ArrayList<>();
			for (CareerReq careerReq : memberMeChangeReq.getCareers()) {
				careers.add(Career.builder()
						.company(careerReq.getCompany())
						.position(careerReq.getPosition())
						.startDate(careerReq.getStartDate())
						.endDate(careerReq.getEndDate())
						.therapist(therapist)
						.build());
			}
			careerRepository.saveAll(careers);
		}
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
