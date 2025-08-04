package com.communet.malmoon.matching.controller;

import com.communet.malmoon.common.auth.CurrentMember;
import com.communet.malmoon.matching.dto.request.TreatmentTimeReq;
import com.communet.malmoon.matching.dto.response.TreatmentTimeRes;
import com.communet.malmoon.matching.service.TreatmentTimeService;
import com.communet.malmoon.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/treatment-time")
@RequiredArgsConstructor
public class TreatmentTimeController {

    private final TreatmentTimeService treatmentTimeService;

    @GetMapping
    public ResponseEntity<TreatmentTimeRes> getTreatmentTime(@CurrentMember Member member) {
        return ResponseEntity.ok(treatmentTimeService.getTreatmentTime(member.getMemberId()));
    }

    @PostMapping
    public ResponseEntity<?> createTreatmentTime(
            @CurrentMember Member member,
            @RequestBody TreatmentTimeReq treatmentTimeCreateReq) {
        treatmentTimeService.createTreatmentTime(member.getMemberId(), treatmentTimeCreateReq);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping
    public ResponseEntity<?> updateTreatmentTime(
            @CurrentMember Member member,
            @RequestBody TreatmentTimeReq treatmentTimeUpdateReq) {
        treatmentTimeService.updateTreatmentTimes(member.getMemberId(), treatmentTimeUpdateReq);
        return ResponseEntity.ok().build();

    }
}
