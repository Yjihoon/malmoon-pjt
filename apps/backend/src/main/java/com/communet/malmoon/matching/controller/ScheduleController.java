package com.communet.malmoon.matching.controller;

import com.communet.malmoon.common.auth.CurrentMember;
import com.communet.malmoon.matching.dto.request.ScheduleGetReq;
import com.communet.malmoon.matching.dto.request.SchedulePostReq;
import com.communet.malmoon.matching.dto.request.ScheduleUpdateReq;
import com.communet.malmoon.matching.dto.response.ScheduleGetRes;
import com.communet.malmoon.matching.service.ScheduleService;
import com.communet.malmoon.member.domain.Member;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // [GET] 치료사의 스케줄 조회 (요청: 치료사 ID, 기간)
    // -> 클라이언트(치료대상자)가 특정 치료사의 스케줄(불가능한 요일/시간)을 조회할 때 사용
    @GetMapping
    public ResponseEntity<ScheduleGetRes> getSchedule(@RequestBody ScheduleGetReq scheduleGetReq) {
        return ResponseEntity.ok().body(scheduleService.getSchedules(scheduleGetReq));
    }

    // [POST] 치료 대상자 → 치료사에게 스케줄 요청
    // 치료 대상자(`@CurrentMember`)가 원하는 날짜, 요일, 시간을 포함한 스케줄을 요청함
    @PostMapping
    public ResponseEntity<?> requestSchedule(
            @CurrentMember Member member,
            @RequestBody SchedulePostReq schedulePostReq) {
        scheduleService.requestSchedule(member, schedulePostReq);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // [PATCH] 치료사가 스케줄 요청 수락/거절
    // 치료사(`@CurrentMember`)가 받은 스케줄 요청을 ACCEPTED 또는 REJECTED 로 변경함
    @PatchMapping
    public ResponseEntity<?> patchSchedule(
            @CurrentMember Member member,
            @RequestBody @Valid ScheduleUpdateReq scheduleUpdateReq) {
        scheduleService.updateStatus(member, scheduleUpdateReq);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/today")
    public ResponseEntity<?> getMemberSchedules(@CurrentMember Member member) {
        return ResponseEntity.ok(scheduleService.getMemberSchedules(member.getMemberId()));
    }

    @GetMapping("/therapist/today")
    public ResponseEntity<?> getTherapistSchedule(@CurrentMember Member member) {
        return ResponseEntity.ok(scheduleService.getTherapistSchedules(member.getMemberId()));
    }
}
