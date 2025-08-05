package com.communet.malmoon.matching.service;

import com.communet.malmoon.matching.domain.DayTime;
import com.communet.malmoon.matching.domain.Schedule;
import com.communet.malmoon.matching.domain.StatusType;
import com.communet.malmoon.matching.dto.request.DayTimeReq;
import com.communet.malmoon.matching.dto.request.ScheduleGetReq;
import com.communet.malmoon.matching.dto.request.SchedulePostReq;
import com.communet.malmoon.matching.dto.request.ScheduleUpdateReq;
import com.communet.malmoon.matching.dto.response.*;
import com.communet.malmoon.matching.repository.ScheduleRepository;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.domain.MemberType;
import com.communet.malmoon.member.domain.Therapist;
import com.communet.malmoon.member.dto.response.CareerRes;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.member.repository.TherapistRepository;
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
    private final TherapistRepository therapistRepository;
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
                .member(member)
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

    public List<MemberPendingRes> getPendingSchedules(Long therapistId) {

        List<Schedule> schedules = scheduleRepository.findAllByTherapist_MemberIdAndStatus(therapistId, StatusType.PENDING);

        return schedules.stream()
                .map(schedule -> {
                    Member member = schedule.getMember();

                    if (member == null) {
                        return null;
                    }

                    return new MemberPendingRes(
                            schedule.getScheduleId(),
                            member.getMemberId(),
                            member.getName(),
                            member.getEmail(),
                            member.getTel1(),
                            member.getCreatedAt()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }

    public List<TherapistRes> getTherapists() {
        List<Member> members = memberRepository.findByRole(MemberType.ROLE_THERAPIST);

        return members.stream()
                .map(member -> {
                    Therapist therapist = therapistRepository.findById(member.getMemberId()).get();
                    List<CareerRes> careerResList = therapist.getCareers().stream()
                            .map(career -> CareerRes.builder()
                                    .company(career.getCompany())
                                    .position(career.getPosition())
                                    .startDate(career.getStartDate())
                                    .endDate(career.getEndDate())
                                    .build()
                            )
                            .toList();

                    return new TherapistRes(
                            member.getMemberId(),
                            member.getName(),
                            member.getEmail(),
                            member.getTel1(),
                            member.getBirthDate(),
                            member.getProfile(),
                            therapist.getCareerYears(),
                            careerResList
                    );
                })
                .toList();
    }

    public List<MyTherapistScheduleRes> getMyTherapists(Member member, StatusType status) {
        List<Schedule> schedules;
        if (status == StatusType.ACCEPTED) {
            schedules = scheduleRepository.findByMemberAndStatus(member, status);
        } else {
            schedules = scheduleRepository.findByMemberAndStatus(member, status);
            schedules.addAll(scheduleRepository.findByMemberAndStatus(member, StatusType.REJECTED));
        }

        return schedules.stream()
                .map(schedule -> {
                    Member therapistMember = schedule.getTherapist();

                    // Therapist -> CareerRes 리스트
                    Therapist therapist = therapistRepository.findById(therapistMember.getMemberId()).get();

                    List<CareerRes> careerResList = therapist.getCareers().stream()
                            .map(career -> CareerRes.builder()
                                    .company(career.getCompany())
                                    .position(career.getPosition())
                                    .startDate(career.getStartDate())
                                    .endDate(career.getEndDate())
                                    .build()
                            )
                            .toList();

                    TherapistRes therapistRes = new TherapistRes(
                            therapistMember.getMemberId(),
                            therapistMember.getName(),
                            therapistMember.getEmail(),
                            therapistMember.getTel1(),
                            therapistMember.getBirthDate(),
                            therapistMember.getProfile(),
                            therapist.getCareerYears(),
                            careerResList
                    );

                    // DayTime → DayTimeRes
                    List<DayTimeRes> dayTimeResList = schedule.getDayTimes().stream()
                            .map(dt -> new DayTimeRes(dt.getDay(), dt.getTime()))
                            .toList();

                    return new MyTherapistScheduleRes(
                            schedule.getScheduleId(),
                            schedule.getStartDate(),
                            schedule.getEndDate(),
                            dayTimeResList,
                            therapistRes
                    );
                })
                .toList();
    }

    public void deleteSchedule(Member member, Long scheduleId) {
        scheduleRepository.deleteByScheduleIdAndMember(scheduleId, member);
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
                                        schedule.getTherapist().getMemberId(),
                                        schedule.getTherapist().getName(),
                                        dt.getTime()
                                ))
                )
                .toList();
    }

    public List<TherapistScheduleRes> getTherapistSchedules(Long therapistId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        String day = dayOfWeek.toString();
        List<Schedule> schedules = scheduleRepository.findAcceptedSchedulesByTherapistIdAndDate(
                therapistId, StatusType.ACCEPTED, date
        );

        return schedules.stream()
                .flatMap(schedule ->
                        schedule.getDayTimes().stream()
                                .filter(dt -> dt.getDay().toString().equals(day))
                                .map(dt -> {
                                    return new TherapistScheduleRes(
                                            schedule.getMember().getMemberId(),
                                            schedule.getMember().getName(),
                                            dt.getTime()
                                    );
                                })
                )
                .toList();
    }
}
