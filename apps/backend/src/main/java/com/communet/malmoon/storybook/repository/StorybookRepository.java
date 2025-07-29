package com.communet.malmoon.storybook.repository;
// JPA 인터페이스

import org.springframework.data.jpa.repository.JpaRepository;
import com.communet.malmoon.storybook.domain.Storybook;


public interface StorybookRepository extends JpaRepository<Storybook, Long> {
}
