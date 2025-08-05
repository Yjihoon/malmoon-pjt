package com.communet.malmoon.matching.repository;

import com.communet.malmoon.matching.domain.Schedule;
import com.communet.malmoon.matching.domain.StatusType;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findAllByTherapist_MemberIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long therapistId,
            LocalDate endDate,
            LocalDate startDate
    );

    @EntityGraph(attributePaths = {"therapist", "dayTimes"})
    @Query("""
    SELECT s FROM Schedule s
    WHERE s.memberId = :memberId
    AND s.status = :status
    AND :date BETWEEN s.startDate AND s.endDate
    """)
    List<Schedule> findAcceptedSchedulesByMemberIdAndDate(
            @Param("memberId") Long memberId,
            @Param("status") StatusType status,
            @Param("date") LocalDate date
    );

    @Query("""
    SELECT s FROM Schedule s
    JOIN FETCH s.therapist t
    LEFT JOIN FETCH s.dayTimes
    WHERE s.status = :status
    AND :date BETWEEN s.startDate AND s.endDate
    AND t.memberId = :therapistId
    """)
    List<Schedule> findAcceptedSchedulesByTherapistIdAndDate(
            @Param("therapistId") Long therapistId,
            @Param("status") StatusType status,
            @Param("date") LocalDate date
    );
}
