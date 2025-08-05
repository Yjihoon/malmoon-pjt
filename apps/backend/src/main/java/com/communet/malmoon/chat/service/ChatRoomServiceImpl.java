package com.communet.malmoon.chat.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.communet.malmoon.chat.domain.ChatRoom;
import com.communet.malmoon.chat.domain.ChatRoomParticipant;
import com.communet.malmoon.chat.domain.RoomType;
import com.communet.malmoon.chat.dto.request.ChatRoomCreateReq;
import com.communet.malmoon.chat.dto.request.ChatRoomSessionCreateReq;
import com.communet.malmoon.chat.dto.response.ChatRoomCreateRes;
import com.communet.malmoon.chat.exception.ChatErrorCode;
import com.communet.malmoon.chat.exception.ChatException;
import com.communet.malmoon.chat.repository.ChatRoomParticipantRepository;
import com.communet.malmoon.chat.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomServiceImpl implements ChatRoomService {

	private final ChatRoomRepository chatRoomRepository;
	private final ChatRoomParticipantRepository participantRepository;

	@Override
	@Transactional
	public ChatRoomCreateRes createOrGetRoom(ChatRoomCreateReq request) {
		// 세션 기반 채팅방 생성 요청일 경우
		if (request instanceof ChatRoomSessionCreateReq sessionReq) {
			return createSessionRoom(sessionReq);
		}

		// 기본 1:1 또는 그룹 채팅방 생성 로직
		return createCommonRoom(request);
	}

	@Override
	public void deleteSessionRoom(Long chatRoomId) {
		ChatRoom room = chatRoomRepository.findById(chatRoomId)
			.orElseThrow(() -> new ChatException(ChatErrorCode.INVALID_ROOM_ID));

		// 종료 시간이 이미 있는 경우 중복 종료 방지 (선택)
		if (room.getEndedAt() != null) {
			return;
		}

		room.setEndedAt(LocalDateTime.now());
		chatRoomRepository.save(room);
	}

	private ChatRoomCreateRes createSessionRoom(ChatRoomSessionCreateReq request) {
		List<Long> participantIds = request.getParticipantIds();
		String sessionId = request.getSessionId();

		// 중복 체크를 위한 세션ID 기반 조회
		Optional<ChatRoom> existingRoom = chatRoomRepository.findBySessionId(sessionId);
		if (existingRoom.isPresent()) {
			return ChatRoomCreateRes.builder()
				.roomId(existingRoom.get().getRoomId())
				.roomType(RoomType.SESSION)
				.participantIds(participantIds)
				.build();
		}

		// 방 생성
		ChatRoom newRoom = ChatRoom.builder()
			.roomType(RoomType.SESSION)
			.sessionId(sessionId)
			.build();
		chatRoomRepository.saveAndFlush(newRoom);

		// 참여자 등록
		for (Long memberId : participantIds) {
			ChatRoomParticipant participant = ChatRoomParticipant.builder()
				.roomId(newRoom.getRoomId())
				.memberId(memberId)
				.build();
			participantRepository.save(participant);
		}

		return ChatRoomCreateRes.builder()
			.roomId(newRoom.getRoomId())
			.roomType(RoomType.SESSION)
			.participantIds(participantIds)
			.build();
	}

	private ChatRoomCreateRes createCommonRoom(ChatRoomCreateReq request) {
		RoomType type = request.getRoomType();
		List<Long> participantIds = request.getParticipantIds();

		// 중복 제거
		Set<Long> uniqueParticipantIds = new HashSet<>(participantIds);
		if (uniqueParticipantIds.size() < 2) {
			throw new ChatException(ChatErrorCode.NOT_ENOUGH_PARTICIPANTS);
		}

		List<Long> sortedIds = new ArrayList<>(uniqueParticipantIds);
		sortedIds.sort(Long::compareTo); // 1:1 채팅 중복 방지용 정렬

		// 1:1 채팅인 경우 동일한 참여자 조합이 존재하는지 조회
		if (type == RoomType.ONE_TO_ONE && participantIds.size() == 2) {
			Optional<ChatRoom> existingRoom = chatRoomRepository
				.findOneToOneRoomByParticipants(participantIds.get(0), participantIds.get(1));
			if (existingRoom.isPresent()) {
				return ChatRoomCreateRes.builder()
					.roomId(existingRoom.get().getRoomId())
					.roomType(type)
					.participantIds(participantIds)
					.build();
			}
		}

		// 채팅방 생성
		ChatRoom newRoom = ChatRoom.builder()
			.roomType(type)
			.build();
		chatRoomRepository.saveAndFlush(newRoom);

		// 참여자 등록
		for (Long memberId : sortedIds) {
			ChatRoomParticipant participant = ChatRoomParticipant.builder()
				.roomId(newRoom.getRoomId())
				.memberId(memberId)
				.build();
			participantRepository.save(participant);
		}

		return ChatRoomCreateRes.builder()
			.roomId(newRoom.getRoomId())
			.roomType(type)
			.participantIds(participantIds)
			.build();
	}
}
