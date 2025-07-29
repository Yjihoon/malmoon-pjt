package com.communet.malmoon.member.dto.request;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class CareerReq {
    private String company;
    private String position;
    private LocalDate startDate;
    private LocalDate endDate;
}
