import React, { useState, useEffect, useRef } from 'react';
import { ListGroup, Image, Alert, Button } from 'react-bootstrap';

function AacTool({ initialSelectedAacIds, allAacs, onSendAac }) {
  const [selectedAacs, setSelectedAacs] = useState([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    // 이 컴포넌트가 마운트되고 props(allAacs, initialSelectedAacIds)가
    // 준비되었을 때 딱 한 번만 초기 선택 상태를 설정합니다.
    if (!isInitialized.current && allAacs && initialSelectedAacIds) {
      
      // 디버깅을 위해 props 값을 확인해보세요.
      // console.log('Initializing with:', { initialSelectedAacIds, allAacs });

      // 부모로부터 받은 initialSelectedAacIds 배열에 포함된 id를 가진 aac 객체만 필터링합니다.
      const initialSelection = allAacs.filter(aac =>
        initialSelectedAacIds.includes(String(aac.id))
      );

      // *** 여기가 핵심입니다 ***
      // 필터링된 결과인 'initialSelection'의 id 목록으로 상태를 설정해야 합니다.
      // 'allAacs'를 사용하면 모든 항목이 선택됩니다.
      setSelectedAacs(initialSelection.map(aac => String(aac.id)));
      
      // 초기화가 완료되었음을 표시합니다.
      isInitialized.current = true;
    }
  }, [initialSelectedAacIds, allAacs]);

  const handleAacSelection = (aacId) => {
    setSelectedAacs(prev => {
      const isSelected = prev.includes(aacId);
      let newState;

      if (isSelected) {
        newState = prev.filter(id => id !== aacId);
      } else {
        if (prev.length < 5) {
          newState = [...prev, aacId];
        } else {
          alert('AAC 아이템은 최대 5개까지 선택할 수 있습니다.');
          newState = prev;
        }
      }
      return newState;
    });
  };

  const handleSendAac = () => {
    const aacsToSend = allAacs.filter(aac => selectedAacs.includes(String(aac.id)));
    if (aacsToSend.length > 0) {
      if (onSendAac) {
        onSendAac(aacsToSend);
      }
      setSelectedAacs([]);
    } else {
      alert('보낼 AAC 아이템을 선택해주세요.');
    }
  };

  if (!allAacs || allAacs.length === 0) {
    return <Alert variant="info">선택된 AAC 도구가 없습니다.</Alert>;
  }

  return (
    <>
      <ListGroup>
        {allAacs.map(aac => (
          <ListGroup.Item
            key={aac.id}
            action
            onClick={() => handleAacSelection(String(aac.id))}
            active={selectedAacs.includes(String(aac.id))}
          >
            <Image src={aac.imageUrl} thumbnail className="me-2" style={{ width: '50px', height: '50px' }} />
            {aac.name} - {aac.description}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="d-grid gap-2 mt-3">
        <Button variant="primary" onClick={handleSendAac} disabled={selectedAacs.length === 0}>
          선택된 AAC 보내기 ({selectedAacs.length}/5)
        </Button>
      </div>
    </>
  );
}

export default AacTool;