package com.communet.malmoon.matching.service;

import com.communet.malmoon.matching.domain.DayTime;
import com.communet.malmoon.matching.domain.Schedule;
import com.communet.malmoon.matching.domain.StatusType;
import com.communet.malmoon.matching.dto.request.DayTimeReq;
import com.communet.malmoon.matching.dto.request.ScheduleGetReq;
import com.communet.malmoon.matching.dto.request.SchedulePostReq;
import com.communet.malmoon.matching.dto.request.ScheduleUpdateReq;
import com.communet.malmoon.matching.dto.response.MemberScheduleRes;
import com.communet.malmoon.matching.dto.response.ScheduleGetRes;
import com.communet.malmoon.matching.dto.response.TherapistScheduleRes;
import com.communet.malmoon.matching.repository.ScheduleRepository;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.repository.MemberRepository;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final MemberRepository memberRepository;
    private final ScheduleRepository scheduleRepository;

    /**
     * 치료사 ID와 기간을 기준으로 겹치는 스케줄 목록을 조회
     * 스케줄 안의 dayTime 리스트를 평탄화(flatMap)하여 모두 반환
     */
    public ScheduleGetRes getSchedules(ScheduleGetReq scheduleGetReq) {
        if (!memberRepository.existsById(scheduleGetReq.getTherapistId())) {
            throw new EntityNotFoundException("해당 치료사가 존재하지 않습니다.");
        }

        List<Schedule> schedules =
                scheduleRepository.findAllByTherapist_MemberIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        scheduleGetReq.getTherapistId(),
                        scheduleGetReq.getEndDate(),
                        scheduleGetReq.getStartDate());

        List<DayTimeReq> allDayTimes = schedules.stream()
                .flatMap(schedule -> schedule.getDayTimes().stream())
                .map(dt -> new DayTimeReq(dt.getDay(), dt.getTime()))
                .toList();

        return new ScheduleGetRes(allDayTimes);
    }

    /**
     * 치료 대상자가 치료사에게 스케줄 요청을 보냄
     * 요청에 포함된 요일/시간 리스트를 DayTime 엔티티로 변환해 Schedule에 연결
     */
    public void requestSchedule(Member member, SchedulePostReq schedulePostReq) {
        Optional<Member> memberOptional = memberRepository.findById(schedulePostReq.getTherapistId());

        if (memberOptional.isEmpty()) {
            throw new EntityNotFoundException("치료사를 찾지 못하였습니다.");
        }

        List<DayTime> dayTimes = schedulePostReq.getDayTimes().stream()
                .map(req -> DayTime.builder()
                        .day(req.getDay())
                        .time(req.getTime())
                        .build())
                .toList();

        Schedule schedule = Schedule.builder()
                .startDate(schedulePostReq.getStartDate())
                .endDate(schedulePostReq.getEndDate())
                .therapist(memberOptional.get())
                .memberId(member.getMemberId())
                .status(StatusType.PENDING)
                .build();

        schedule.addAllDayTimes(dayTimes);

        scheduleRepository.save(schedule);
    }

    /**
     * 치료사가 스케줄 상태(PENDING → ACCEPTED/REJECTED) 변경
     * - 치료사 본인만 해당 스케줄 수정 가능
     * - 이미 처리된 스케줄은 수정 불가
     */
    @Transactional
    public void updateStatus(Member member, ScheduleUpdateReq scheduleUpdateReq) {
        Optional<Schedule> scheduleOptional = scheduleRepository.findById(scheduleUpdateReq.getScheduleId());

        if (scheduleOptional.isEmpty()) {
            throw new EntityNotFoundException("해당 스케줄이 존재하지 않습니다.");
        }
        Schedule schedule = scheduleOptional.get();
        if (!Objects.equals(schedule.getTherapist().getMemberId(), member.getMemberId())) {
            throw new AccessDeniedException("해당 스케줄에 대한 권한이 없습니다.");
        }
        if (schedule.getStatus() != StatusType.PENDING) {
            throw new IllegalStateException("이미 처리된 스케줄입니다.");
        }

        schedule.setStatus(scheduleUpdateReq.getStatus());
    }

    public List<MemberScheduleRes> getMemberSchedules(Long memberId) {
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        String day = dayOfWeek.toString();
        List<Schedule> schedules = scheduleRepository.findAcceptedSchedulesByMemberIdAndDate(
                memberId, StatusType.ACCEPTED, today
        );

        return schedules.stream()
                .flatMap(schedule ->
                        schedule.getDayTimes().stream()
                                .filter(dt -> dt.getDay().toString().equals(day))
                                .map(dt -> new MemberScheduleRes(
                                        schedule.getTherapist().getName(),
                                        dt.getTime()
                                ))
                )
                .toList();
    }

    public List<TherapistScheduleRes> getTherapistSchedules(Long therapistId) {
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        String day = dayOfWeek.toString();
        List<Schedule> schedules = scheduleRepository.findAcceptedSchedulesByTherapistIdAndDate(
                therapistId, StatusType.ACCEPTED, today
        );

        return schedules.stream()
                .flatMap(schedule ->
                        schedule.getDayTimes().stream()
                                .filter(dt -> dt.getDay().toString().equals(day))
                                .map(dt -> {
                                    Member member = memberRepository.findById(schedule.getMemberId()).get();
                                    return new TherapistScheduleRes(
                                            member.getName(),
                                            dt.getTime()
                                    );
                                })
                )
                .toList();
    }
}
