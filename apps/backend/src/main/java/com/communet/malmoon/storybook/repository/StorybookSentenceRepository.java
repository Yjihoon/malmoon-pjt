package com.communet.malmoon.storybook.repository;
// 동화책 문장 테이블 JPA 인터페이스 생성
import org.springframework.data.jpa.repository.JpaRepository;
import com.communet.malmoon.storybook.domain.StorybookSentence;

public interface StorybookSentenceRepository extends JpaRepository<StorybookSentence, Long> {
}
