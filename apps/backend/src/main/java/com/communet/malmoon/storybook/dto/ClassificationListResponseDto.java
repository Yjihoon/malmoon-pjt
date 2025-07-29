package com.communet.malmoon.storybook.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor

public class ClassificationListResponseDto {
    private List<String> classifications;
}
