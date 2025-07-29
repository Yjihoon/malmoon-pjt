package com.communet.malmoon.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.communet.malmoon.member.domain.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
	boolean existsByEmail(String email);
	Optional<Member> getByEmail(String email);
	Optional<Member> findByEmail(String email);
}
