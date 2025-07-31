package com.communet.malmoon.member.domain;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
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
	@Column(name = "file_id", columnDefinition = "bigint",  nullable = false)
	private Long fileId;

	@OneToMany(cascade = CascadeType.ALL)
	@Builder.Default
	private List<Career> careers = new ArrayList<>();
}
