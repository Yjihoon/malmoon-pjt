package com.communet.malmoon.member.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "therapist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Therapist {
	@Id
	private Long therapist_id;
	@Column(name = "careerYears", columnDefinition = "int",  nullable = false)
	private Integer careerYears;

	// @OneToOne(fetch = FetchType.LAZY)
	// @JoinColumn(name = "qualification_image_id")
	// private File qualificationImage;
}
