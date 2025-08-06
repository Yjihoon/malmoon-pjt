package com.communet.malmoon.matching.dto.response;

import com.communet.malmoon.matching.domain.DayType;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class DayTimeRes {
    private DayType day;
    private Integer time;
}
