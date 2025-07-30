package com.communet.malmoon.aac.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AacCreateReq {
	private String situation;
	private String action;
	private String emotion;
}
