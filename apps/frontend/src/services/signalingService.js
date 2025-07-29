// frontend/src/services/signalingService.js

/**
 * WebRTC 개발을 위한 모의(Mock) 시그널링 서비스입니다.
 * 이 클래스는 실제 웹소켓 기반 시그널링 서버의 동작을 시뮬레이션합니다.
 * 네트워크를 통해 메시지를 보내는 대신 콘솔에 메시지를 로깅합니다.
 * 이를 통해 실제 백엔드 없이도 WebRTC 로직을 개발하고 테스트할 수 있습니다.
 */
class SignalingService {
  constructor() {
    // 메시지 "수신" 시 트리거될 콜백 함수입니다.
    this.onMessage = null;
    console.log("시그널링 서비스 (모의) 초기화됨");
  }

  /**
   * 시그널링 서버에 연결하는 것을 시뮬레이션합니다.
   * @param {string} roomId 참여할 방 ID입니다.
   */
  connect(roomId) {
    console.log(`시그널링 서비스: ${roomId} 방에 연결 시뮬레이션 중...`);
    // 실제 구현에서는 웹소켓 연결을 설정합니다.
    // setTimeout(() => {
    //   console.log("시그널링 서비스: 연결 설정됨 (모의).");
    // }, 500);
  }

  /**
   * 서버로 메시지(예: offer, answer, candidate)를 보내는 것을 시뮬레이션합니다.
   * @param {string} type 메시지 유형 (예: 'offer', 'answer', 'candidate')입니다.
   * @param {any} data 메시지의 페이로드입니다.
   */
  send(type, data) {
    console.log(`시그널링 서비스: ==> 메시지 전송 (모의)`, { type, payload: data });
    // 실제 구현에서는 `socket.emit(type, data)`가 됩니다.
  }

  /**
   * 시그널링 서버에서 연결을 끊는 것을 시뮬레이션합니다.
   */
  disconnect() {
    console.log("시그널링 서비스: 연결 해제 중 (모의)...");
    // 실제 구현에서는 웹소켓 연결을 닫습니다.
  }

  /**
   * 개발자가 수동으로 메시지 수신을 시뮬레이션하기 위한 헬퍼 메서드입니다.
   * 실제 구현에서는 웹소켓의 'onmessage' 이벤트에 의해 트리거됩니다.
   * @param {string} type 수신된 메시지 유형입니다.
   * @param {any} data 메시지의 페이로드입니다.
   */
  mockReceive(type, data) {
    console.log(`시그널링 서비스: <== 모의 메시지 수신`, { type, payload: data });
    if (this.onMessage) {
      this.onMessage({ type, data });
    } else {
      console.warn("시그널링 서비스: onMessage 콜백이 설정되지 않았습니다. 메시지는 로깅되었지만 처리되지 않았습니다.");
    }
  }
}

// Export a singleton instance of the service.
export const signalingService = new SignalingService();
