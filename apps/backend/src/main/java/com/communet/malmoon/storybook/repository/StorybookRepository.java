package com.communet.malmoon.storybook.repository;
// JPA 인터페이스

import org.springframework.data.jpa.repository.JpaRepository;
import com.communet.malmoon.storybook.domain.Storybook;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface StorybookRepository extends JpaRepository<Storybook, Long> {
    @Query("SELECT DISTINCT s.classification FROM Storybook s")
    List<String> findDistinctClassifications();
}
