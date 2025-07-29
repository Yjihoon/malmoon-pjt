package com.communet.malmoon.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.communet.malmoon.member.domain.Therapist;

public interface TherapistRepository extends JpaRepository<Therapist, Long> {
}
