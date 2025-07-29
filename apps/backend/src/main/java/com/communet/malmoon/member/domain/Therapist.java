package com.communet.malmoon.member.domain;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
	@Column(name = "therapist_id")
	private Long therapistId;
	@Column(name = "careerYears", columnDefinition = "int",  nullable = false)
	private Integer careerYears;

	// @OneToOne(fetch = FetchType.LAZY)
	// @JoinColumn(name = "qualification_image_id")
	// private File qualificationImage;

	@OneToMany(mappedBy = "therapist", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Career> careers = new ArrayList<>();
}
