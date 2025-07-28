package com.communet.malmoon.member.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.domain.MemberType;
import com.communet.malmoon.member.domain.Therapist;
import com.communet.malmoon.member.dto.request.MemberJoinReq;
import com.communet.malmoon.member.dto.request.TherapistJoinReq;
import com.communet.malmoon.member.exception.DuplicateEmailException;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.member.repository.TherapistRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
class MemberServiceTest {

	@Autowired
	private MemberService memberService;

	@Autowired
	private MemberRepository memberRepository;

	@Autowired
	private TherapistRepository therapistRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void cleanup() {
		therapistRepository.deleteAll();
		memberRepository.deleteAll();
	}

	@Test
	@Transactional
	@DisplayName("회원가입 성공")
	void joinSuccess() {
		// given
		MemberJoinReq req = new MemberJoinReq();
		req.setEmail("test@example.com");
		req.setPassword("password123");
		req.setName("김싸피");
		req.setNickname("tester");
		req.setBirthDate(LocalDate.of(1990, 1, 1));
		req.setTel1("01012345678");
		req.setTel2("01087654321");

		// when
		memberService.join(req);

		// then
		Member saved = memberRepository.findByEmail(("test@example.com")).orElse(null);
		assertNotNull(saved);
		assertEquals("tester", saved.getNickname());
		assertTrue(passwordEncoder.matches("password123", saved.getPassword()));
	}

	@Test
	@Transactional
	@DisplayName("치료사 회원가입 성공")
	void joinTherapistSuccess() {
		// given
		TherapistJoinReq req = new TherapistJoinReq();
		req.setEmail("therapist@example.com");
		req.setPassword("securePassword!");
		req.setName("이치료");
		req.setNickname("healer");
		req.setBirthDate(LocalDate.of(1985, 5, 20));
		req.setTel1("01012345678");
		req.setTel2("01087654321");
		req.setCareerYears(7);

		// when
		memberService.joinTherapist(req);

		// then
		Member savedMember = memberRepository.findByEmail("therapist@example.com").orElse(null);
		assertNotNull(savedMember);
		assertEquals("healer", savedMember.getNickname());
		assertEquals(MemberType.ROLE_THERAPIST, savedMember.getRole());
		assertTrue(passwordEncoder.matches("securePassword!", savedMember.getPassword()));

		Therapist savedTherapist = therapistRepository.findById(savedMember.getMemberId()).orElse(null);
		assertNotNull(savedTherapist);
		assertEquals(7, savedTherapist.getCareerYears());
	}

	@Test
	@Transactional
	@DisplayName("중복 이메일 가입 시 예외 발생")
	void joinDuplicateEmail() {
		// given
		MemberJoinReq req = new MemberJoinReq();
		req.setEmail("test@example.com");
		req.setPassword("password123");
		req.setName("김싸피");
		req.setNickname("tester");
		req.setBirthDate(LocalDate.of(1990, 1, 1));
		req.setTel1("01012345678");
		req.setTel2("01087654321");

		memberService.join(req);

		// when & then
		MemberJoinReq dupReq = new MemberJoinReq();
		dupReq.setEmail("test@example.com");
		dupReq.setPassword("password123");
		dupReq.setName("김싸피");
		dupReq.setNickname("tester");
		dupReq.setBirthDate(LocalDate.of(1990, 1, 1));
		dupReq.setTel1("01012345678");
		dupReq.setTel2("01087654321");

		assertThrows(DuplicateEmailException.class, () -> memberService.join(dupReq));
	}
}
