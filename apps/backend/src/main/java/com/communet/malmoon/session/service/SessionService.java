package com.communet.malmoon.session.service;

import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.session.config.LiveKitConfig;
import io.livekit.server.*;
import jakarta.persistence.EntityNotFoundException;
import livekit.LivekitWebhook;
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

    private final LiveKitConfig liveKitConfig;
    private final RedisTemplate<String, Object> redisTemplate;
    private final HashOperations<String, Object, Object> hashOps;
    private final MemberRepository memberRepository;
    private final RoomServiceClient roomServiceClient;

    public SessionService(
            @Qualifier("redisTemplate0") RedisTemplate<String, Object> redisTemplate,
            MemberRepository memberRepository,
            LiveKitConfig liveKitConfig,
            RoomServiceClient roomServiceClient) {
        this.liveKitConfig = liveKitConfig;
        this.redisTemplate = redisTemplate;
        this.hashOps = redisTemplate.opsForHash();
        this.memberRepository = memberRepository;
        this.roomServiceClient = roomServiceClient;
    }

    /**
     * 치료사가 세션 방을 생성하고, Redis에 관련 정보 저장 후 토큰 반환
     * - 기존 세션이 있으면 삭제
     * - 랜덤 UUID로 room 생성
     * - Redis에 therapist, client, 생성 시간 저장
     *
     * @param therapist 현재 로그인한 치료사
     * @param clientId 세션을 할 클라이언트 ID
     * @return JWT 기반 LiveKit 세션 접속 토큰
     */
    @Transactional
    public String storeRoomInfo(Member therapist, Long clientId) {

        // 이미 생성한 세션이 있으면 삭제
        if (redisTemplate.hasKey(REDIS_THERAPIST_PREFIX + therapist.getEmail())) {
            deleteRoomInfo(therapist.getEmail());
        }

        // 랜덤한 room 이름 생성
        String roomName = UUID.randomUUID().toString();
        String clientEmail = getClientEmail(clientId);
        String sessionKey = REDIS_ROOM_PREFIX + roomName;
        String now = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        // Redis Hash에 방 정보 저장
        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("therapist", therapist.getEmail());
        sessionData.put("client", clientEmail);
        sessionData.put("createdAt", now);
        hashOps.putAll(sessionKey, sessionData);

        // Redis String에 therapist/client → roomName 매핑 저장
        redisTemplate.opsForValue().set(REDIS_THERAPIST_PREFIX + therapist.getEmail(), roomName);
        redisTemplate.opsForValue().set(REDIS_CLIENT_PREFIX + clientEmail, roomName);

        return generateAccessToken(therapist, roomName);
    }

    /**
     * 치료사의 세션 방 정보를 Redis에서 삭제
     * @param therapistEmail 삭제 대상 치료사 이메일
     */
    @Transactional
    public void deleteRoomInfo(String therapistEmail) {
        String roomName = Objects.requireNonNull(redisTemplate.opsForValue().get(REDIS_THERAPIST_PREFIX + therapistEmail), "생성한 세션이 없습니다.").toString();
        String clientEmail = Objects.requireNonNull(hashOps.get(REDIS_ROOM_PREFIX + roomName, "client")).toString();
        redisTemplate.delete(REDIS_ROOM_PREFIX + roomName);
        redisTemplate.delete(REDIS_THERAPIST_PREFIX + therapistEmail);
        redisTemplate.delete(REDIS_CLIENT_PREFIX + clientEmail);

        roomServiceClient.deleteRoom(roomName);
    }

    /**
     * 클라이언트가 참여 중인 방 이름을 얻고, 접속 토큰 반환
     * @param client 현재 로그인한 클라이언트
     * @return JWT 기반 LiveKit 세션 접속 토큰
     */
    public String getJoinRoomName(Member client) {
        String roomName = Objects.requireNonNull(redisTemplate.opsForValue().get(REDIS_CLIENT_PREFIX + client.getEmail()), "참여할 수 있는 세션이 없습니다.").toString();
        return generateAccessToken(client, roomName);
    }

    public void getWebhookReceiver(String authHeader, String body) {
        WebhookReceiver webhookReceiver =  new WebhookReceiver(liveKitConfig.getApiKey(), liveKitConfig.getApiSecret());
        try {
            LivekitWebhook.WebhookEvent event = webhookReceiver.receive(body, authHeader);
            log.info("LiveKit Webhook: " + event.toString());
        } catch (Exception e) {
            log.error("Error validating webhook event: " + e.getMessage());
        }
    }

    private String getClientEmail(Long clientId) {
        Optional<Member> client = memberRepository.findById(clientId);
        if (client.isEmpty()) {
            throw new EntityNotFoundException("해당 멤버를 찾을 수 없습니다.");
        }
        return client.get().getEmail();
    }

    /**
     * LiveKit 방 입장용 Access Token 생성
     * @param member 사용자 (치료사 또는 클라이언트)
     * @param roomName 방 이름
     * @return JWT 토큰 문자열
     */
    private String generateAccessToken(Member member, String roomName) {
        AccessToken token = new AccessToken(liveKitConfig.getApiKey(), liveKitConfig.getApiSecret());
        token.setName(member.getNickname());
        token.setIdentity(member.getEmail());
        token.addGrants(new RoomJoin(true), new RoomName(roomName));
        return token.toJwt();
    }
}