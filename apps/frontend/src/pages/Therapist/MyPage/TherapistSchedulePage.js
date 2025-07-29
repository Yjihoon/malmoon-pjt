import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Modal, Tab, Tabs, Image, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해 사용
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; // react-calendar 임포트
import 'react-calendar/dist/Calendar.css'; // react-calendar 기본 CSS 임포트
import './TherapistSchedulePage.css'; // 새로 생성할 커스텀 CSS 파일 임포트

function TherapistSchedulePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [schedules, setSchedules] = useState([]); // 치료 일정 데이터 상태
    const [allIndividualTools, setAllIndividualTools] = useState([]); // 모든 개별 도구 데이터 (AAC, Filter)
    const [allToolSets, setAllToolSets] = useState([]); // 모든 도구 묶음 (세트) 데이터

    // 캘린더 관련 상태
    const [selectedDate, setSelectedDate] = useState(new Date()); // 캘린더에서 선택된 날짜

    // 도구 선택 모달 관련 상태
    const [showToolSelectionModal, setShowToolSelectionModal] = useState(false);
    const [currentSessionSchedule, setCurrentSessionSchedule] = useState(null); // 현재 수업 시작하려는 일정 정보
    const [selectedToolsForSession, setSelectedToolsForSession] = useState([]); // 현재 세션에 선택된 도구 ID 목록
    const [modalInnerTabKey, setModalInnerTabKey] = useState('aacSets'); // 도구 선택 모달 내 탭 상태
    const [fairyTaleSearchQuery, setFairyTaleSearchQuery] = useState('');
    const [selectedFairyTale, setSelectedFairyTale] = useState(null); // { id, title, totalPages }
    const [fairyTaleStartPage, setFairyTaleStartPage] = useState(1);
    const [fairyTaleEndPage, setFairyTaleEndPage] = useState(1);
    const [fairyTales, setFairyTales] = useState([]); // Dummy fairy tale data

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
                    const nextDay = (now.getDate() + 1).toString().padStart(2, '0');

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
                            date: `${year}-${month}-${nextDay}`, // 내일 날짜
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

                    // 더미 동화 데이터
                    const dummyFairyTales = [
                        { id: 'ft1', title: '아기 돼지 삼형제', totalPages: 15, description: '늑대를 피해 집을 짓는 아기 돼지들의 이야기' },
                        { id: 'ft2', title: '흥부와 놀부', totalPages: 20, description: '착한 흥부와 욕심 많은 놀부의 이야기' },
                        { id: 'ft3', title: '빨간 모자', totalPages: 10, description: '할머니 댁에 가는 빨간 모자와 늑대의 이야기' },
                    ];
                    setFairyTales(dummyFairyTales);

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

        const scheduleDateTime = new Date(year, month - 1, day, hours, minutes, 0);

        const diffMilliseconds = scheduleDateTime.getTime() - now.getTime();
        const diffMinutes = diffMilliseconds / (1000 * 60);

        return diffMinutes <= 30 && diffMinutes >= -60;
    };

    // '수업 시작' 버튼 클릭 핸들러: 도구 선택 모달 표시
    const handleStartSessionClick = (schedule) => {
        setCurrentSessionSchedule(schedule); // 현재 시작하려는 일정 저장
        setSelectedToolsForSession(schedule.assignedTools || []);
        setModalInnerTabKey('aacSets'); // 모달 열릴 때 기본 탭을 AAC 묶음으로 설정
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

        const roomId = uuidv4();
        console.log(`RTC 방 생성 요청: ${roomId}, 선택된 도구:`, selectedToolsForSession);

        setSessionRoomId(roomId);
        setIsSessionActive(true);

        setShowToolSelectionModal(false);
        alert(`'${currentSessionSchedule.clientName}'님과의 수업방이 생성되었습니다!\n방 ID: ${roomId}\n선택된 도구: ${selectedToolsForSession.map(id => allIndividualTools.find(t => t.id === id)?.name || id).join(', ')}`);

        let navPath = `/session/${roomId}?tools=${selectedToolsForSession.join(',')}`;
        if (selectedFairyTale) {
            navPath += `&fairyTaleId=${selectedFairyTale.id}&startPage=${fairyTaleStartPage}&endPage=${fairyTaleEndPage}`;
        }
        navigate(navPath);
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

    // 동화 불러오기 핸들러 (더미)
    const handleFairyTaleLoad = () => {
        const foundFairyTale = fairyTales.find(ft => ft.title.includes(fairyTaleSearchQuery));
        if (foundFairyTale) {
            setSelectedFairyTale(foundFairyTale);
            setFairyTaleStartPage(1);
            setFairyTaleEndPage(foundFairyTale.totalPages);
        } else {
            setSelectedFairyTale(null);
            setFairyTaleStartPage(1);
            setFairyTaleEndPage(1);
            alert('해당 동화를 찾을 수 없습니다.');
        }
    };

    const aacTools = allIndividualTools.filter(tool => tool.type === 'AAC');
    const filterTools = allIndividualTools.filter(tool => tool.type === 'Filter');

    // 선택된 날짜의 일정만 필터링
    const filteredSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.toDateString() === selectedDate.toDateString();
    });

    // 캘린더 날짜에 마커 표시 로직
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
            const hasSchedule = schedules.some(s => s.date === dateString);
            // 필요하다면 fairyTales에도 mark를 추가할 수 있습니다.
            // const hasFairyTaleActivity = fairyTales.some(ft => /* 동화 관련 로직 */);

            if (hasSchedule) {
                return (
                    <div className="dot-marker-container">
                        <span className="dot-marker schedule-marker" title="치료기록/과제"></span>
                        {/* <span className="dot-marker session-marker" title="수업"></span> */}
                    </div>
                );
            }
        }
        return null;
    };

    // 캘린더 네비게이션 헤더 포맷 변경 (예: 2025년, 7월)
    const formatMonthYear = (locale, date) => {
        return `${date.getFullYear()}년, ${date.getMonth() + 1}월`;
    };


    return (
        <Container fluid className="therapist-schedule-page-container"> {/* full width 컨테이너 */}
            <Row className="h-100"> {/* 높이 100% */}
                {/* 좌측: 캘린더 영역 */}
                <Col md={7} className="calendar-panel d-flex flex-column p-4">
                    <div className="title-container mb-4">
                        <h2 className="page-title">나의 치료 일정</h2>
                        <div className="btn-container">
                            <Button variant="primary" onClick={() => navigate('/therapist/register-schedule')}>
                                일정 등록하기
                            </Button>
                        </div>
                    </div>
                    {isSessionActive && (
                        <Alert variant="success" className="mb-4 d-flex justify-content-between align-items-center">
                            현재 수업이 진행 중입니다! 방 ID: `{sessionRoomId}`
                            <Button variant="outline-success" onClick={() => setIsSessionActive(false)}>
                                수업 종료 (더미)
                            </Button>
                        </Alert>
                    )}

                    <Card className="shadow-sm card-base calendar-card flex-grow-1">
                        <Card.Body className="d-flex flex-column">
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                                className="react-calendar-custom"
                                formatMonthYear={formatMonthYear} // 월/년도 포맷 적용
                                prevLabel={<i className="bi bi-chevron-left"></i>} // 부트스트랩 아이콘 사용
                                nextLabel={<i className="bi bi-chevron-right"></i>} // 부트스트랩 아이콘 사용
                                prev2Label={null} // 이전 2년 버튼 제거
                                next2Label={null} // 다음 2년 버튼 제거
                                tileContent={tileContent} // 날짜 셀에 마커 추가
                                locale="ko-KR" // 한국어 로케일 설정
                            />
                            <div className="calendar-legend mt-3">
                                <span className="dot-marker schedule-marker me-2"></span> 치료기록/과제
                                {/* <span className="dot-marker session-marker ms-3 me-2"></span> 수업 */}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 우측: 상세 일정 목록 영역 */}
                <Col md={5} className="schedule-detail-panel p-4">
                    <h2 className="mb-4 right-panel-title">일정</h2>
                    <div className="selected-date-display mb-3">
                        {selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        의 일정
                    </div>

                    <Card className="shadow-sm p-3 card-base schedule-list-card flex-grow-1">
                        <Card.Body>
                            {filteredSchedules.length === 0 ? (
                                <Alert variant="info" className="text-center">등록된 일정이 없습니다.</Alert>
                            ) : (
                                <ListGroup variant="flush">
                                    {filteredSchedules
                                        .sort((a, b) => a.time.localeCompare(b.time)) // 시간 순으로 정렬
                                        .map(schedule => {
                                            const readyToStart = isSessionReady(schedule.date, schedule.time);
                                            const isCompleted = schedule.status === '완료됨';

                                            return (
                                                <ListGroup.Item key={schedule.id} className="schedule-item-card mb-3">
                                                    <Row className="align-items-center">
                                                        <Col xs={8}>
                                                            <div className="schedule-info">
                                                                <div className="schedule-time">{schedule.time}</div>
                                                                <div className="schedule-client-name">{schedule.clientName}</div>
                                                                <div className="schedule-session-type text-muted">{schedule.sessionType}</div>
                                                            </div>
                                                        </Col>
                                                        <Col xs={4} className="text-end">
                                                            {isCompleted ? (
                                                                <Button variant="secondary" size="sm" disabled>
                                                                    수업 완료
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    className={readyToStart ? "btn-soft-primary" : "btn-soft-secondary"}
                                                                    onClick={() => handleStartSessionClick(schedule)}
                                                                    disabled={!readyToStart || isSessionActive}
                                                                    size="sm"
                                                                >
                                                                    {readyToStart ? '수업 시작' : '수업 예정'}
                                                                </Button>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            );
                                        })}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 도구 선택 모달 (기존 코드와 동일) */}
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
                            <Tab eventKey="aacSets" title="AAC 묶음">
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
                            <Tab eventKey="sessionSets" title="수업 세트">
                                <ListGroup style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {allToolSets.length === 0 ? (
                                        <ListGroup.Item className="text-muted">등록된 도구 묶음이 없습니다.</ListGroup.Item>
                                    ) : (
                                        allToolSets.map(toolSet => (
                                            <ListGroup.Item
                                                key={toolSet.id}
                                                action
                                                onClick={() => {
                                                    const newSelectedTools = new Set(selectedToolsForSession);
                                                    toolSet.toolIds.forEach(toolId => newSelectedTools.add(toolId));
                                                    setSelectedToolsForSession(Array.from(newSelectedTools));
                                                }}
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
                            <Tab eventKey="fairyTale" title="동화 선택">
                                <div className="p-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>동화 제목 검색</Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                placeholder="동화 제목을 입력하세요"
                                                value={fairyTaleSearchQuery}
                                                onChange={(e) => setFairyTaleSearchQuery(e.target.value)}
                                                className="me-2"
                                            />
                                            <Button variant="primary" onClick={handleFairyTaleLoad}>
                                                동화 불러오기
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    {selectedFairyTale && (
                                        <Card className="mt-3 p-3 shadow-sm">
                                            <Card.Title>{selectedFairyTale.title}</Card.Title>
                                            <Card.Text>총 페이지: {selectedFairyTale.totalPages} 페이지</Card.Text>
                                            <Row>
                                                <Col>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>시작 페이지</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={fairyTaleStartPage}
                                                            onChange={(e) => setFairyTaleStartPage(Math.max(1, Math.min(parseInt(e.target.value), selectedFairyTale.totalPages)))}
                                                            min={1}
                                                            max={selectedFairyTale.totalPages}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>끝 페이지</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={fairyTaleEndPage}
                                                            onChange={(e) => setFairyTaleEndPage(Math.max(1, Math.min(parseInt(e.target.value), selectedFairyTale.totalPages)))}
                                                            min={fairyTaleStartPage}
                                                            max={selectedFairyTale.totalPages}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card>
                                    )}
                                </div>
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
                            {selectedFairyTale && (
                                <div className="mt-2">
                                    <p>선택된 동화:</p>
                                    <Badge bg="info">
                                        {selectedFairyTale.title} ({fairyTaleStartPage}p ~ {fairyTaleEndPage}p)
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowToolSelectionModal(false)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleCreateSessionRoom} disabled={selectedToolsForSession.length === 0 && !selectedFairyTale}>
                        수업 시작 (방 생성)
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default TherapistSchedulePage;