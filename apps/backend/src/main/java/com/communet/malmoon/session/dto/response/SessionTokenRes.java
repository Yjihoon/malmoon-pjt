package com.communet.malmoon.session.dto.response;

import lombok.Getter;

@Getter
public class SessionTokenRes {
    private String token;
    public SessionTokenRes(String token) {
        this.token = token;
    }
}