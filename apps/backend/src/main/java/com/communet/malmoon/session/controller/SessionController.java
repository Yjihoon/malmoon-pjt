package com.communet.malmoon.session.controller;

import com.communet.malmoon.common.auth.CurrentMember;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.session.dto.request.SessionRoomReq;
import com.communet.malmoon.session.dto.response.SessionTokenRes;
import com.communet.malmoon.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.WebhookReceiver;
import livekit.LivekitWebhook.WebhookEvent;

@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    @Value("${livekit.api.key}")
    private String LIVEKIT_API_KEY;

    @Value("${livekit.api.secret}")
    private String LIVEKIT_API_SECRET;

    private final SessionService sessionService;

    @PostMapping("/room")
    @PreAuthorize("hasRole('ROLE_THERAPIST')")
    public ResponseEntity<?> createRoom(@RequestBody SessionRoomReq req, @CurrentMember Member member) {
        String roomName = sessionService.storeRoomInfo(member.getEmail(), req.getClientId());

        String token = generateAccessToken(member, roomName);
        return ResponseEntity.ok(new SessionTokenRes(token));
    }

    @DeleteMapping("/room")
    @PreAuthorize("hasRole('ROLE_THERAPIST')")
    public ResponseEntity<?> deleteRoom(@CurrentMember Member member) {
        sessionService.deleteRoom(member.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<?> joinRoom(@CurrentMember Member member) {
        String roomName = sessionService.getJoinRoomName(member.getEmail());

        String token = generateAccessToken(member, roomName);
        return ResponseEntity.ok(new SessionTokenRes(token));
    }

    private String generateAccessToken(Member member, String roomName) {
        AccessToken token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
        token.setName(member.getNickname());
        token.setIdentity(member.getEmail());
        token.addGrants(new RoomJoin(true), new RoomName(roomName));
        return token.toJwt();
    }

    @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
    public ResponseEntity<String> receiveWebhook(@RequestHeader("Authorization") String authHeader, @RequestBody String body) {
        WebhookReceiver webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
        try {
            WebhookEvent event = webhookReceiver.receive(body, authHeader);
            System.out.println("LiveKit Webhook: " + event.toString());
        } catch (Exception e) {
            System.err.println("Error validating webhook event: " + e.getMessage());
        }
        return ResponseEntity.ok("ok");
    }
}
