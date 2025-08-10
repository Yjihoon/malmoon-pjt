package com.communet.malmoon.session.service.retry;

import io.livekit.server.RoomServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import retrofit2.Response;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoomDeletionRetryScheduler {

    private final FailedRoomDeletionQueue retryQueue;
    private final RoomServiceClient roomServiceClient;

    @Scheduled(fixedDelay = 60000) // 1분마다 실행
    public void retryFailedDeletions() {
        String roomName;
        while ((roomName = retryQueue.poll()) != null) {
            try {
                Response<Void> response = roomServiceClient.deleteRoom(roomName).execute();
                if (response.isSuccessful()) {
                    log.info("재시도: {} 방 삭제 성공", roomName);
                } else {
                    log.warn("재시도: {} 방 삭제 실패, 코드: {}", roomName, response.code());
                    retryQueue.add(roomName); // 다시 큐에 넣기
                }
            } catch (IOException e) {
                log.warn("재시도: {} 방 삭제 중 예외 발생: {}", roomName, e.getMessage());
                retryQueue.add(roomName); // 다시 큐에 넣기
            }
        }
    }
}
