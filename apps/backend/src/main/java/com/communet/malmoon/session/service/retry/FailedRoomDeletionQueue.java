package com.communet.malmoon.session.service.retry;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FailedRoomDeletionQueue {

    private final String RETRY_QUEUE_KEY = "failedRoomDeletionQueue";
    private final StringRedisTemplate redisTemplate;

    public void add(String roomName) {
        redisTemplate.opsForList().rightPush(RETRY_QUEUE_KEY, roomName);
    }

    public String poll() {
        return redisTemplate.opsForList().leftPop(RETRY_QUEUE_KEY);
    }
}
