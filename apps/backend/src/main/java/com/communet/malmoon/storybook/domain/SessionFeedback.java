package com.communet.malmoon.storybook.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.communet.malmoon.member.domain.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionFeedback {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "child_id")
	private Member child;

	private LocalDate date;

	private double accuracy;

	@Column(columnDefinition = "TEXT")
	private String feedbackText;

	private int lastPage;

	private LocalDateTime createdAt;

	// ✅ 새로 추가된 필드
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "storybook_id")
	private Storybook storybook;
}
