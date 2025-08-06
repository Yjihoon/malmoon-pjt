import React from 'react';
import { Button } from 'react-bootstrap';

function ChatTool({ chatMessages, chatInput, setChatInput, sendChatMessage }) {
  return (
    <div className="chat-panel d-flex flex-column h-100">
      <div className="chat-messages flex-grow-1 overflow-auto p-2">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender === '나' ? 'my-message' : 'other-message'}`}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input-area p-2 border-top">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="메시지를 입력하세요..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendChatMessage();
              }
            }}
          />
          <Button variant="primary" onClick={sendChatMessage}>
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatTool;
