package com.communet.malmoon.chat.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.communet.malmoon.chat.domain.ChatMessage;
import com.communet.malmoon.chat.dto.request.ChatSessionMessageReq;
import com.communet.malmoon.chat.exception.ChatErrorCode;
import com.communet.malmoon.chat.exception.ChatException;
import com.communet.malmoon.chat.repository.ChatMessageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRedisServiceImpl implements ChatRedisService {

	private final RedisTemplate<String, String> redisTemplate;
	private final ChatMessageRepository chatMessageRepository;
	private final ObjectMapper objectMapper;

	private String getRedisKey(String sessionId) {
		return "chat:session:" + sessionId;
	}

	@Override
	public void saveToRedis(ChatSessionMessageReq request) {
		try {
			String redisKey = getRedisKey(String.valueOf(request.getSessionId()));
			String json = objectMapper.writeValueAsString(request);
			redisTemplate.opsForList().rightPush(redisKey, json);
		} catch (JsonProcessingException e) {
			log.error("Redis 저장 실패: {}", e.getMessage());
			throw new ChatException(ChatErrorCode.REDIS_SAVE_FAILED);
		}
	}

	@Override
	public void flushSessionMessagesToDb(String sessionId) {
		String redisKey = getRedisKey(sessionId);
		List<String> messages = redisTemplate.opsForList().range(redisKey, 0, -1);
		if (messages == null || messages.isEmpty()) {
			log.info("저장할 메시지가 없음: {}", sessionId);
			throw new ChatException(ChatErrorCode.MESSAGE_EMPTY);
		}

		List<ChatMessage> chatMessages = new ArrayList<>();
		for (String json : messages) {
			try {
				ChatSessionMessageReq request = objectMapper.readValue(json, ChatSessionMessageReq.class);
				ChatMessage message = ChatMessage.builder()
					.roomId(request.getRoomId())
					.senderId(request.getSenderId())
					.content(request.getContent())
					.messageType(request.getMessageType())
					.sentAt(request.getSendAt())
					.build();
				chatMessages.add(message);
			} catch (JsonProcessingException e) {
				log.warn("Redis → 객체 변환 실패: {}", e.getMessage());
				continue;
			}
		}

		try {
			chatMessageRepository.saveAll(chatMessages);
			log.info("Redis 메시지를 DB로 저장 완료 ({}개)", chatMessages.size());
			redisTemplate.delete(redisKey);
		} catch (Exception e) {
			log.error("DB 저장 실패: {}", e.getMessage());
			throw new ChatException(ChatErrorCode.DB_SAVE_FAILED);
		}

	}
}
