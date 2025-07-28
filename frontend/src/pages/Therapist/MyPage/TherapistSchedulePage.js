import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Modal, Tab, Tabs, Image, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해 사용
import { useNavigate } from 'react-router-dom'; // 이 줄을 추가합니다.


function TherapistSchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState([]); // 치료 일정 데이터 상태
  const [allIndividualTools, setAllIndividualTools] = useState([]); // 모든 개별 도구 데이터 (AAC, Filter)
  const [allToolSets, setAllToolSets] = useState([]); // 모든 도구 묶음 (세트) 데이터
  
  // 도구 선택 모달 관련 상태
  const [showToolSelectionModal, setShowToolSelectionModal] = useState(false);
  const [currentSessionSchedule, setCurrentSessionSchedule] = useState(null); // 현재 수업 시작하려는 일정 정보
  const [selectedToolsForSession, setSelectedToolsForSession] = useState([]); // 현재 세션에 선택된 도구 ID 목록
  const [modalInnerTabKey, setModalInnerTabKey] = useState('aac'); // 도구 선택 모달 내 탭 상태

  // RTC 방 생성 및 세션 활성화 관련 더미 상태
  const [sessionRoomId, setSessionRoomId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false); // 현재 진행 중인 세션이 있는지 여부

  useEffect(() => {
    const fetchScheduleAndTools = async () => {
      setLoading(true);
      setError('');
      try {
        if (user && user.userType === 'therapist') {
          // --- 더미 데이터 로딩 ---
          // 실제 환경에서는 백엔드 API를 통해 데이터를 불러옵니다.

          // 더미 치료 일정 데이터
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          
          // 현재 시간 +10분, +40분, 내일 오전 11시 예시
          const hourNow = now.getHours();
          const minuteNow = now.getMinutes();
          
          const timePlus10Min = new Date(now.getTime() + 10 * 60 * 1000);
          const timePlus40Min = new Date(now.getTime() + 40 * 60 * 1000);

          const dummySchedules = [
            { 
              id: 'sch1', 
              date: `${year}-${month}-${day}`, 
              time: `${timePlus10Min.getHours().toString().padStart(2, '0')}:${timePlus10Min.getMinutes().toString().padStart(2, '0')}`, 
              clientName: '김민준', 
              status: '예정됨', 
              sessionType: '언어 발달', 
              assignedTools: [] 
            },
            { 
              id: 'sch2', 
              date: `${year}-${month}-${day}`, 
              time: `${timePlus40Min.getHours().toString().padStart(2, '0')}:${timePlus40Min.getMinutes().toString().padStart(2, '0')}`, 
              clientName: '이서윤', 
              status: '예정됨', 
              sessionType: '사회성 기술', 
              assignedTools: [] 
            },
            { 
              id: 'sch3', 
              date: `${year}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${(now.getDate() + 1).toString().padStart(2, '0')}`, // 내일 날짜
              time: '11:00', 
              clientName: '박하준', 
              status: '예정됨', 
              sessionType: '조음 훈련', 
              assignedTools: [] 
            },
            { 
              id: 'sch4', 
              date: `${year}-${month}-${day}`, 
              time: `09:00`, // 이미 지난 시간
              clientName: '최예원', 
              status: '완료됨', 
              sessionType: '인지 발달', 
              assignedTools: [] 
            },
          ];
          setSchedules(dummySchedules);

          // 더미 개별 도구 데이터
          const dummyIndividualTools = [
            { id: 'aac1', type: 'AAC', name: '그림카드 세트 A', description: '다양한 사물, 동물 그림 카드 (50장)', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Card1' },
            { id: 'aac2', type: 'AAC', name: '문장 구성 보드', description: '주어-동사-목적어 연습 보드', category: '문법', lastModified: '2025-07-18', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Board' },
            { id: 'aac3', type: 'AAC', name: '단어 확장 게임', description: '유사어/반의어 연결 게임', category: '어휘', lastModified: '2025-07-23', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Game' },
            { id: 'filter1', type: 'Filter', name: '강아지 귀 필터', description: '화상 캠에 강아지 귀를 추가합니다.', category: '동물', lastModified: '2025-07-22', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Dog' },
            { id: 'filter2', type: 'Filter', name: '왕관 필터', description: '화상 캠에 반짝이는 왕관을 추가합니다.', category: '액세서리', lastModified: '2025-07-21', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Crown' },
            { id: 'filter3', type: 'Filter', name: '안경 필터', description: '다양한 디자인의 안경을 씌웁니다.', category: '의상', lastModified: '2025-07-24', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Glasses' },
          ];
          setAllIndividualTools(dummyIndividualTools);

          // 더미 도구 묶음(세트) 데이터
          const dummyToolSets = [
            { id: 'set1', name: '초기 언어 발달 세션용', description: '그림카드와 문장 보드를 활용한 기초 세션', lastModified: '2025-07-25', toolIds: ['aac1', 'aac2', 'filter1'] },
            { id: 'set2', name: '사회성 기술 훈련용', description: '감정 표현 AAC와 상황 필터', lastModified: '2025-07-24', toolIds: ['aac3', 'filter2', 'filter3'] },
          ];
          setAllToolSets(dummyToolSets);

        } else {
          setError('치료사 계정으로 로그인해야 치료 일정을 관리할 수 있습니다.');
        }
      } catch (err) {
        setError('일정 및 도구 정보를 불러오는 데 실패했습니다.');
        console.error('데이터 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleAndTools();
    
    // 1분마다 시간을 확인하여 버튼 상태 업데이트 (실제 환경에서는 더 정교한 스케줄링 필요)
    const interval = setInterval(() => {
        setSchedules(prevSchedules => [...prevSchedules]); // 상태를 강제로 업데이트하여 리렌더링 유도
    }, 60 * 1000); // 1분마다

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 클리어
  }, [user]);

  // 수업 시작 가능 여부 확인 함수
  const isSessionReady = (scheduleDate, scheduleTime) => {
    const now = new Date();
    const [year, month, day] = scheduleDate.split('-').map(Number);
    const [hours, minutes] = scheduleTime.split(':').map(Number);

    // JavaScript Date 객체는 월을 0부터 시작 (0: 1월, 11: 12월)
    const scheduleDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    // 현재 시간과 일정 시간의 차이 (분 단위)
    const diffMilliseconds = scheduleDateTime.getTime() - now.getTime();
    const diffMinutes = diffMilliseconds / (1000 * 60);

    // 수업 시작 30분 전부터 60분 후까지 '수업 시작' 버튼 활성화
    // 이 범위는 필요에 따라 조절할 수 있습니다.
    return diffMinutes <= 30 && diffMinutes >= -60; 
  };

  // '수업 시작' 버튼 클릭 핸들러: 도구 선택 모달 표시
  const handleStartSessionClick = (schedule) => {
    setCurrentSessionSchedule(schedule); // 현재 시작하려는 일정 저장
    // 이전에 할당된 도구가 있다면 미리 선택된 상태로 모달 띄우기 (현재 더미는 빈 배열)
    setSelectedToolsForSession(schedule.assignedTools || []); 
    setModalInnerTabKey('aac'); // 모달 열릴 때 기본 탭을 AAC로 설정
    setShowToolSelectionModal(true);
  };

  // 도구 선택 모달 내 도구/묶음 선택 핸들러
  const handleToolSelectionInModal = (toolId) => {
    setSelectedToolsForSession(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId) 
        : [...prev, toolId]
    );
  };

  // 도구 선택 모달에서 '수업 시작 (방 생성)' 버튼 클릭 핸들러
  const handleCreateSessionRoom = () => {
    if (!currentSessionSchedule) {
      alert('시작할 수업 일정이 선택되지 않았습니다.');
      return;
    }

    // 선택된 도구들을 기반으로 RTC 방을 생성하는 로직 (현재는 더미)
    const roomId = uuidv4(); // 고유한 방 ID 생성
    console.log(`RTC 방 생성 요청: ${roomId}, 선택된 도구:`, selectedToolsForSession);
    
    // TODO: 실제 RTC 라이브러리 연동 코드 (예: Agora SDK 초기화, 채널 참여, 선택된 도구 정보 전달 등)
    // 예시: const rtcClient = new AgoraRTC.createClient(...);
    // rtcClient.join(appId, roomId, token, uid, () => { ... });

    // 더미 세션 활성화
    setSessionRoomId(roomId);
    setIsSessionActive(true); // 세션이 활성화되었음을 표시 (다른 수업 시작 버튼 비활성화용)
    
    setShowToolSelectionModal(false); // 모달 닫기
    alert(`'${currentSessionSchedule.clientName}'님과의 수업방이 생성되었습니다!\n방 ID: ${roomId}\n선택된 도구: ${selectedToolsForSession.map(id => allIndividualTools.find(t => t.id === id)?.name || id).join(', ')}`);
    
    // 실제로는 여기에 RTC 방으로 리다이렉트하는 로직이 들어갑니다.
    navigate(`/session/${roomId}?tools=${selectedToolsForSession.join(',')}`);
    // 또는 현재 페이지에서 RTC 컴포넌트를 조건부 렌더링할 수 있습니다.
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>일정 정보를 불러오는 중입니다...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user || user.userType !== 'therapist') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">치료사만 접근할 수 있는 페이지입니다.</Alert>
      </Container>
    );
  }

  const aacTools = allIndividualTools.filter(tool => tool.type === 'AAC');
  const filterTools = allIndividualTools.filter(tool => tool.type === 'Filter');

  return (
    <Container className="my-5 main-container">
      <h2 className="text-center mb-4">나의 치료 일정</h2>

      {isSessionActive && (
        <Alert variant="success" className="mb-4 d-flex justify-content-between align-items-center">
          현재 수업이 진행 중입니다! 방 ID: `{sessionRoomId}`
          <Button variant="outline-success" onClick={() => setIsSessionActive(false)}>
            수업 종료 (더미)
          </Button>
        </Alert>
      )}

      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base mb-4">
            <Card.Body>
              <Card.Title className="mb-3">예정된 치료 일정</Card.Title>
              {schedules.length === 0 ? (
                <Alert variant="info" className="text-center">예정된 치료 일정이 없습니다.</Alert>
              ) : (
                <Row>
                  {schedules.map(schedule => {
                    const readyToStart = isSessionReady(schedule.date, schedule.time);
                    const isCompleted = schedule.status === '완료됨'; // '완료됨' 상태인 경우

                    return (
                      <Col md={6} lg={4} className="mb-4" key={schedule.id}>
                        <Card className="shadow-sm card-base mb-3">
                          <Card.Body className="p-3">
                            <Row className="align-items-center">
                              <Col md={6}>
                                <Card.Title>{schedule.sessionType} ({schedule.clientName})</Card.Title>
                                <Card.Text>
                                  <strong>날짜:</strong> {schedule.date}<br/>
                                  <strong>시간:</strong> {schedule.time}<br/>
                                  <strong>상태:</strong> {isCompleted ? '완료됨' : (readyToStart ? '시작 가능' : '예정됨')}
                                </Card.Text>
                              </Col>
                              <Col md={6} className="text-md-end">
                                {isCompleted ? (
                                   <Button variant="secondary" className="w-100 mt-2" disabled>
                                     수업 완료
                                   </Button>
                                ) : (
                                  <Button 
                                    className={readyToStart ? "btn-soft-primary w-100 mt-2" : "btn-soft-secondary w-100 mt-2"} 
                                    onClick={() => handleStartSessionClick(schedule)}
                                    disabled={!readyToStart || isSessionActive} // 시작 준비 안되거나 다른 세션 활성화 시 비활성화
                                  >
                                    {readyToStart ? '수업 시작' : `수업 예정 (${schedule.time})`}
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 도구 선택 모달 */}
      <Modal show={showToolSelectionModal} onHide={() => setShowToolSelectionModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentSessionSchedule ? `'${currentSessionSchedule.clientName}'님과의 수업 도구 선택` : '수업에 사용할 도구 선택'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="mb-2">개별 도구 또는 묶음 도구 선택</Form.Label>
            <Tabs
              id="tool-selection-for-session-tabs"
              activeKey={modalInnerTabKey}
              onSelect={(k) => setModalInnerTabKey(k)}
              className="mb-2"
              justify
            >
              <Tab eventKey="aac" title="AAC 도구">
                <ListGroup style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {aacTools.length === 0 ? (
                    <ListGroup.Item className="text-muted">등록된 AAC 도구가 없습니다.</ListGroup.Item>
                  ) : (
                    aacTools.map(tool => (
                      <ListGroup.Item 
                        key={tool.id} 
                        action 
                        onClick={() => handleToolSelectionInModal(tool.id)}
                        active={selectedToolsForSession.includes(tool.id)}
                      >
                        <Row className="align-items-center">
                          <Col xs={2}>
                            {tool.imageUrl && <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover' }} />}
                          </Col>
                          <Col xs={10}>
                            {tool.name} ({tool.category})
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Tab>
              <Tab eventKey="filter" title="필터 도구">
                <ListGroup style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {filterTools.length === 0 ? (
                    <ListGroup.Item className="text-muted">등록된 필터 도구가 없습니다.</ListGroup.Item>
                  ) : (
                    filterTools.map(tool => (
                      <ListGroup.Item 
                        key={tool.id} 
                        action 
                        onClick={() => handleToolSelectionInModal(tool.id)}
                        active={selectedToolsForSession.includes(tool.id)}
                      >
                        <Row className="align-items-center">
                          <Col xs={2}>
                            {tool.imageUrl && <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover' }} />}
                          </Col>
                          <Col xs={10}>
                            {tool.name} ({tool.category})
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Tab>
              <Tab eventKey="toolSets" title="도구 묶음">
                 <ListGroup style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {allToolSets.length === 0 ? (
                    <ListGroup.Item className="text-muted">등록된 도구 묶음이 없습니다.</ListGroup.Item>
                  ) : (
                    allToolSets.map(toolSet => (
                      <ListGroup.Item 
                        key={toolSet.id} 
                        action 
                        // 묶음을 선택하면 묶음에 포함된 모든 도구들을 선택된 도구 목록에 추가 (중복 방지)
                        onClick={() => {
                          const newSelectedTools = new Set(selectedToolsForSession);
                          toolSet.toolIds.forEach(toolId => newSelectedTools.add(toolId));
                          setSelectedToolsForSession(Array.from(newSelectedTools));
                        }}
                        // 묶음에 있는 도구 중 하나라도 선택되어 있다면 활성화 표시 (선택 해제 로직은 복잡해지므로 단순화)
                        active={toolSet.toolIds.some(toolId => selectedToolsForSession.includes(toolId))}
                      >
                        <Row className="align-items-center">
                          <Col xs={12}>
                            <h5>{toolSet.name}</h5>
                            <p className="mb-1 text-muted">{toolSet.description || '설명 없음'}</p>
                            <div>
                               {toolSet.toolIds.map(toolId => {
                                 const tool = allIndividualTools.find(t => t.id === toolId);
                                 return tool ? (
                                   <Badge key={toolId} bg={tool.type === 'AAC' ? 'primary' : 'success'} className="me-1 mb-1">
                                     {tool.name}
                                   </Badge>
                                 ) : null;
                               })}
                             </div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  )}
                 </ListGroup>
              </Tab>
            </Tabs>
            <div className="mt-3">
              <p>현재 수업에 선택된 도구 ({selectedToolsForSession.length}개):</p>
              <div className="d-flex flex-wrap">
                {selectedToolsForSession.length === 0 ? (
                  <Badge bg="secondary">선택된 도구가 없습니다.</Badge>
                ) : (
                  selectedToolsForSession.map(toolId => {
                    const tool = allIndividualTools.find(t => t.id === toolId);
                    return tool ? (
                      <Badge key={toolId} bg={tool.type === 'AAC' ? 'primary' : 'success'} className="me-2 mb-2">
                        {tool.name} 
                        <Button 
                          variant="link" 
                          className="p-0 ms-2 text-decoration-none" 
                          style={{ color: 'white', fontSize: '0.8em' }}
                          onClick={() => handleToolSelectionInModal(toolId)} // 클릭 시 선택 해제
                        >
                          &times;
                        </Button>
                      </Badge>
                    ) : null;
                  })
                )}
              </div>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowToolSelectionModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleCreateSessionRoom} disabled={selectedToolsForSession.length === 0}>
            수업 시작 (방 생성)
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TherapistSchedulePage;