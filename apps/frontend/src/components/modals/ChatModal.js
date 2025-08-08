import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { SendFill } from 'react-bootstrap-icons'; // 아이콘 추가

function ChatModal({ show, handleClose, clientDetails, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const roomId = clientDetails?.roomId; // clientDetails에서 roomId 가져오기

  // 메시지 폴링
  useEffect(() => {
    let intervalId;
    if (show && roomId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/v1/chat/room/${roomId}/messages`, {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error(`메시지 불러오기 실패: ${response.statusText}`);
          }
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('메시지 불러오기 오류:', error);
        }
      };

      fetchMessages(); // 모달 열릴 때 즉시 메시지 불러오기
      intervalId = setInterval(fetchMessages, 3000); // 3초마다 폴링
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [show, roomId, user]);

  useEffect(() => {
    // 모달이 열릴 때마다 메시지 초기화 (새로운 클라이언트와의 채팅을 위해)
    if (show) {
      setMessages([]);
      setNewMessage('');
    }
  }, [show, clientDetails]);

  useEffect(() => {
    // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    if (!roomId || !user || !user.memberId) {
      alert("채팅방 정보 또는 사용자 정보가 없습니다.");
      return;
    }

    try {
      const messageToSend = {
        roomId: roomId,
        senderId: user.memberId,
        content: newMessage,
        messageType: 'TALK', // 메시지 타입은 TALK으로 고정
        sendAt: new Date().toISOString(), // 현재 시간을 ISO 형식으로 전송
      };

      const response = await fetch(`/api/v1/chat/room/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        throw new Error(`메시지 전송 실패: ${response.statusText}`);
      }

      const sentMessage = await response.json();
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{clientDetails ? `${clientDetails.name}님과의 채팅` : '채팅'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.messageId || msg.id} // messageId 또는 id 사용
              className={`d-flex mb-2 ${msg.senderId === user?.memberId ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-2 rounded ${msg.senderId === user.user.memberId ? 'bg-primary text-white' : 'bg-light'}`}
                style={{ maxWidth: '70%' }}
              >
                {msg.content}
                <div className="text-end" style={{ fontSize: '0.75em', opacity: 0.7 }}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button variant="primary" onClick={handleSendMessage}>
            <SendFill />
          </Button>
        </InputGroup>
      </Modal.Footer>
    </Modal>
  );
}

export default ChatModal;
