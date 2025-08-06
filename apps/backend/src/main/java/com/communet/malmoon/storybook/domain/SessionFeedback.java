package com.communet.malmoon.storybook.domain;

import com.communet.malmoon.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    private String accuracy;

    @Column(length = 1000)
    private String feedbackText;

    private int lastPage;

    private LocalDateTime createdAt;
}
