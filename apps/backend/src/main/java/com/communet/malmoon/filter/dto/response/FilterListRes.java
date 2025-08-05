package com.communet.malmoon.filter.dto.response;

import java.util.List;

public class FilterListRes {
    List<FilterDto> filters;
    public FilterListRes(List<FilterDto> filters) {
        this.filters = filters;
    }
}
