import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import ChatTool from './ChatTool';
import FairyTaleTool from './FairyTaleTool';
import FilterTool from './FilterTool';

function ToolPanel({
  activeToolTab, setShowToolPanel,
  chatMessages, chatInput, setChatInput, sendChatMessage,
  fairyTaleInfo, fairyTaleContent, currentFairyTalePage,
  selectedSentence, setSelectedSentence, handlePageChange,
  sendSentence, isRecording, startRecording, stopRecording,
  backgroundImages, selectedBackgroundImage, isFilterActive,
  applyBackgroundFilter, removeBackgroundFilter, applyLensById
}) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          {activeToolTab === 'aac' ? 'AAC 도구' :
           activeToolTab === 'filter' ? '필터 도구' :
           activeToolTab === 'chat' ? '채팅' : '동화 도구'}
        </h5>
        <Button variant="light" size="sm" onClick={() => setShowToolPanel(false)}>&times;</Button>
      </Card.Header>
      <Card.Body className="p-2">
        {activeToolTab === 'aac' && ( <Alert variant="info" className="text-center m-2">AAC 도구 기능 구현 예정</Alert> )}
        {activeToolTab === 'chat' && (
          <ChatTool
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChatMessage={sendChatMessage}
          />
        )}
        {activeToolTab === 'fairyTale' && fairyTaleInfo && (
          <FairyTaleTool
            fairyTaleInfo={fairyTaleInfo}
            fairyTaleContent={fairyTaleContent}
            currentFairyTalePage={currentFairyTalePage}
            selectedSentence={selectedSentence}
            setSelectedSentence={setSelectedSentence}
            handlePageChange={handlePageChange}
            sendSentence={sendSentence}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        )}
        {activeToolTab === 'filter' && (
          <FilterTool
            backgroundImages={backgroundImages}
            selectedBackgroundImage={selectedBackgroundImage}
            isFilterActive={isFilterActive}
            applyBackgroundFilter={applyBackgroundFilter}
            removeBackgroundFilter={removeBackgroundFilter}
            applyLensById={applyLensById}
          />
        )}
      </Card.Body>
    </Card>
  );
}

export default ToolPanel;
