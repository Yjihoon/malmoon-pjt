package com.communet.malmoon.storybook.repository;

import com.communet.malmoon.storybook.domain.SpeechResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

// SpeechResultRepository.java
public interface SpeechResultRepository extends JpaRepository<SpeechResult, Long> {
    List<SpeechResult> findByChildIdAndCreatedAtBetween(Long childId, LocalDateTime start, LocalDateTime end);
}

