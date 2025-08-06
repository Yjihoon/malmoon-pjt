package com.communet.malmoon.storybook.repository;

import com.communet.malmoon.storybook.domain.SessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, Long> {
    // 필요하면 날짜/아동별 조회 메서드 추가 가능
}
