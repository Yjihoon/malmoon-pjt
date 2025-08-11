package com.communet.malmoon.diagnostic.repository;

import com.communet.malmoon.diagnostic.domain.InitialTestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InitialTestAttemptRepository extends JpaRepository<InitialTestAttempt, UUID> {
}
