package com.communet.malmoon.session.service;

import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class SessionService {

    private final String REDIS_ROOM_PREFIX = "session:room:";
    private final String REDIS_THERAPIST_PREFIX = "user:therapist:";
    private final String REDIS_CLIENT_PREFIX = "user:client:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final HashOperations<String, Object, Object> hashOps;
    private final MemberRepository memberRepository;

    public SessionService(@Qualifier("redisTemplate0") RedisTemplate<String, Object> redisTemplate, MemberRepository memberRepository) {
        this.redisTemplate = redisTemplate;
        this.hashOps = redisTemplate.opsForHash();
        this.memberRepository = memberRepository;
    }

    @Transactional
    public String storeRoomInfo(String therapistEmail, Long clientId) {
        String roomName = UUID.randomUUID().toString();

        String clientEmail = getClientEmail(clientId);
        String sessionKey = REDIS_ROOM_PREFIX + roomName;
        String now = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("therapist", therapistEmail);
        sessionData.put("client", clientEmail);
        sessionData.put("createdAt", now);

        hashOps.putAll(sessionKey, sessionData);

        redisTemplate.opsForValue().set(REDIS_THERAPIST_PREFIX + therapistEmail, roomName);
        redisTemplate.opsForValue().set(REDIS_CLIENT_PREFIX + clientEmail, roomName);

        return roomName;
    }

    @Transactional
    public void deleteRoom(String therapistEmail) {
        String roomName = Objects.requireNonNull(redisTemplate.opsForValue().get(REDIS_THERAPIST_PREFIX + therapistEmail), "생성한 세션이 없습니다.").toString();
        String clientEmail = Objects.requireNonNull(hashOps.get(REDIS_ROOM_PREFIX + roomName, "client")).toString();
        redisTemplate.delete(REDIS_ROOM_PREFIX + roomName);
        redisTemplate.delete(REDIS_THERAPIST_PREFIX + therapistEmail);
        redisTemplate.delete(REDIS_CLIENT_PREFIX + clientEmail);
    }

    public String getJoinRoomName(String clientEmail) {
        return Objects.requireNonNull(redisTemplate.opsForValue().get(REDIS_CLIENT_PREFIX + clientEmail), "참여할 수 있는 세션이 없습니다.").toString();
    }

    private String getClientEmail(Long clientId) {
        Optional<Member> client = memberRepository.findById(clientId);
        if (client.isEmpty()) {
            throw new EntityNotFoundException("해당 멤버를 찾을 수 없습니다.");
        }
        return client.get().getEmail();
    }
}