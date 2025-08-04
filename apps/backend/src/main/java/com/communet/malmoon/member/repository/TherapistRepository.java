package com.communet.malmoon.member.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.communet.malmoon.member.domain.Therapist;

import java.util.Optional;

public interface TherapistRepository extends JpaRepository<Therapist, Long> {
    @EntityGraph(attributePaths = {"treatmentTimes"})
    Optional<Therapist> findByTherapistId(Long id);
}
