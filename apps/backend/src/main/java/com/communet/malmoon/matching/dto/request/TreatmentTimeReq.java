package com.communet.malmoon.matching.dto.request;

import com.communet.malmoon.matching.domain.DayType;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class TreatmentTimeReq {
    private Map<DayType, List<Integer>> treatmentTimes;
    public TreatmentTimeReq(Map<DayType, List<Integer>> treatmentTimes) {
        this.treatmentTimes = treatmentTimes;
    }
}
