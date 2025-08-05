package com.communet.malmoon.matching.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberPendingRes {
    private Long scheduleId;
    private Long memberId;
    private String name;
    private String email;
    private String telephone;
    private LocalDateTime createDate;
}
