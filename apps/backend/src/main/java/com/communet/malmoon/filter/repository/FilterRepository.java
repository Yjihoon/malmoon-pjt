package com.communet.malmoon.filter.repository;

import com.communet.malmoon.filter.domain.Filter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilterRepository extends JpaRepository<Filter, Long> {
}
