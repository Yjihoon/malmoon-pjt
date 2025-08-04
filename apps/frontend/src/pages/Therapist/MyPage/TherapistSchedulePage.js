import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Modal, Tab, Tabs, Image, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해 사용
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; // react-calendar 임포트
import 'react-calendar/dist/Calendar.css'; // react-calendar 기본 CSS 임포트
import './TherapistSchedulePage.css'; // 새로 생성할 커스텀 CSS 파일 임포트
import axios from 'axios'; // axios 임포트

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

    // 동화책 관련 상태
    const [fairyTaleClassifications, setFairyTaleClassifications] = useState([]);
    const [selectedClassification, setSelectedClassification] = useState('');
    const [fairyTaleTitles, setFairyTaleTitles] = useState([]);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [selectedFairyTaleInfo, setSelectedFairyTaleInfo] = useState(null); // { title, minPage, maxPage }
    const [fairyTaleStartPage, setFairyTaleStartPage] = useState(1);
    const [fairyTaleEndPage, setFairyTaleEndPage] = useState(1);
    const [fairyTaleCurrentPage, setFairyTaleCurrentPage] = useState(1);


    // RTC 방 생성 및 세션 활성화 관련 더미 상태
    const [sessionRoomId, setSessionRoomId] = useState(null);
    const [isSessionActive, setIsSessionActive] = useState(false); // 현재 진행 중인 세션이 있는지 여부

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                if (user && user.userType === 'therapist') {
                    // --- 더미 데이터 로딩 (일정, 개별도구, 도구세트) ---
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = (now.getMonth() + 1).toString().padStart(2, '0');
                    const day = now.getDate().toString().padStart(2, '0');
                    const nextDay = (now.getDate() + 1).toString().padStart(2, '0');
                    const timePlus10Min = new Date(now.getTime() + 10 * 60 * 1000);
                    const timePlus40Min = new Date(now.getTime() + 40 * 60 * 1000);

                    const dummySchedules = [
                        { id: 'sch1', date: `${year}-${month}-${day}`, time: `${timePlus10Min.getHours().toString().padStart(2, '0')}:${timePlus10Min.getMinutes().toString().padStart(2, '0')}`, clientName: '김민준', clientId: 1, status: '예정됨', sessionType: '언어 발달', assignedTools: [] },
                        { id: 'sch2', date: `${year}-${month}-${day}`, time: `${timePlus40Min.getHours().toString().padStart(2, '0')}:${timePlus40Min.getMinutes().toString().padStart(2, '0')}`, clientName: '이서윤', clientId: 2, status: '예정됨', sessionType: '사회성 기술', assignedTools: [] },
                        { id: 'sch3', date: `${year}-${month}-${nextDay}`, time: '11:00', clientName: '박하준', clientId: 3, status: '예정됨', sessionType: '조음 훈련', assignedTools: [] },
                        { id: 'sch4', date: `${year}-${month}-${day}`, time: `09:00`, clientName: '최예원', clientId: 4, status: '완료됨', sessionType: '인지 발달', assignedTools: [] },
                    ];
                    setSchedules(dummySchedules);

                    const dummyIndividualTools = [
                        { id: 'aac1', type: 'AAC', name: '그림카드 세트 A', description: '다양한 사물, 동물 그림 카드 (50장)', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Card1' },
                        { id: 'aac2', type: 'AAC', name: '문장 구성 보드', description: '주어-동사-목적어 연습 보드', category: '문법', lastModified: '2025-07-18', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Board' },
                        { id: 'filter1', type: 'Filter', name: '강아지 귀 필터', description: '화상 캠에 강아지 귀를 추가합니다.', category: '동물', lastModified: '2025-07-22', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Dog' },
                    ];
                    setAllIndividualTools(dummyIndividualTools);

                    const dummyToolSets = [
                        { id: 'set1', name: '초기 언어 발달 세션용', description: '그림카드와 문장 보드를 활용한 기초 세션', lastModified: '2025-07-25', toolIds: ['aac1', 'aac2', 'filter1'] },
                    ];
                    setAllToolSets(dummyToolSets);

                    // 동화책 장르 목록 불러오기
                    const response = await axios.get('/api/v1/storybooks/classifications');
                    setFairyTaleClassifications(response.data.classifications || []);

                } else {
                    setError('치료사 계정으로 로그인해야 치료 일정을 관리할 수 있습니다.');
                }
            } catch (err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                console.error('데이터 불러오기 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        const interval = setInterval(() => {
            setSchedules(prevSchedules => [...prevSchedules]);
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    // 선택된 장르가 변경될 때 동화책 제목 목록 불러오기
    useEffect(() => {
        if (!selectedClassification) {
            setFairyTaleTitles([]);
            setSelectedTitle('');
            setFairyTaleCurrentPage(1);
            return;
        }

        const fetchTitles = async () => {
            try {
                const response = await axios.get(`/api/v1/storybooks/titles?classification=${selectedClassification}`);
                setFairyTaleTitles(response.data.titles || []);
                setSelectedTitle(''); // 장르 변경 시 제목 선택 초기화
                setFairyTaleCurrentPage(1);
            } catch (err) {
                console.error('동화책 제목 목록 불러오기 오류:', err);
                setError('동화책 제목을 불러오는 데 실패했습니다.');
            }
        };

        fetchTitles();
    }, [selectedClassification]);

    // 선택된 제목이 변경될 때 페이지 범위 불러오기
    useEffect(() => {
        if (!selectedTitle) {
            setSelectedFairyTaleInfo(null);
            return;
        }

        const fetchPageRange = async () => {
            try {
                const response = await axios.get(`/api/v1/storybooks/pages?title=${encodeURIComponent(selectedTitle)}`);
                const { minPage, maxPage } = response.data;
                setSelectedFairyTaleInfo({ title: selectedTitle, minPage, maxPage });
                setFairyTaleStartPage(minPage);
                setFairyTaleEndPage(maxPage);
            } catch (err) {
                console.error('페이지 범위 불러오기 오류:', err);
                // 서버 오류 발생 시 기본값으로 설정하여 UI 깨짐 방지
                setSelectedFairyTaleInfo({ title: selectedTitle, minPage: 1, maxPage: 1 });
                setFairyTaleStartPage(1);
                setFairyTaleEndPage(1);
                setError('동화책 페이지 정보를 불러오는 데 실패했습니다. 기본값으로 설정됩니다.');
            }
        };

        fetchPageRange();
    }, [selectedTitle]);


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
        setCurrentSessionSchedule(schedule);
        setSelectedToolsForSession(schedule.assignedTools || []);
        setModalInnerTabKey('aacSets');
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
        alert(`'${currentSessionSchedule.clientName}'님과의 수업방이 생성되었습니다!\n방 ID: ${roomId}`);

        let navPath = `/session/${roomId}?tools=${selectedToolsForSession.join(',')}`;
        if (selectedFairyTaleInfo) {
            navPath += `&fairyTaleTitle=${encodeURIComponent(selectedFairyTaleInfo.title)}&fairyTaleClassification=${selectedClassification}&startPage=${fairyTaleStartPage}&endPage=${fairyTaleEndPage}`;
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

    const aacTools = allIndividualTools.filter(tool => tool.type === 'AAC');
    const filterTools = allIndividualTools.filter(tool => tool.type === 'Filter');

    // 선택된 날짜의 일정만 필터링
    const filteredSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.toDateString() === selectedDate.toDateString();
    });

    // 동화책 페이지네이션 로직
    const fairyTalesPerPage = 5;
    const totalFairyTalePages = Math.ceil(fairyTaleTitles.length / fairyTalesPerPage);
    const paginatedFairyTaleTitles = fairyTaleTitles.slice(
        (fairyTaleCurrentPage - 1) * fairyTalesPerPage,
        fairyTaleCurrentPage * fairyTalesPerPage
    );

    const handleFairyTalePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalFairyTalePages) {
            setFairyTaleCurrentPage(pageNumber);
        }
    };

    // 캘린더 날짜에 마커 표시 로직
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0];
            const hasSchedule = schedules.some(s => s.date === dateString);
            if (hasSchedule) {
                return (
                    <div className="dot-marker-container">
                        <span className="dot-marker schedule-marker" title="치료기록/과제"></span>
                    </div>
                );
            }
        }
        return null;
    };

    const formatMonthYear = (locale, date) => {
        return `${date.getFullYear()}년, ${date.getMonth() + 1}월`;
    };


    return (
        <Container fluid className="therapist-schedule-page-container">
            <Row className="h-100">
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
                                formatMonthYear={formatMonthYear}
                                prevLabel={<i className="bi bi-chevron-left"></i>}
                                nextLabel={<i className="bi bi-chevron-right"></i>}
                                prev2Label={null}
                                next2Label={null}
                                tileContent={tileContent}
                                locale="ko-KR"
                            />
                            <div className="calendar-legend mt-3">
                                <span className="dot-marker schedule-marker me-2"></span> 치료기록/과제
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

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
                                        .sort((a, b) => a.time.localeCompare(b.time))
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
                                                                <Button variant="secondary" size="sm" disabled>수업 완료</Button>
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

            <Modal show={showToolSelectionModal} onHide={() => setShowToolSelectionModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{currentSessionSchedule ? `'${currentSessionSchedule.clientName}'님과의 수업 도구 선택` : '수업에 사용할 도구 선택'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        id="tool-selection-for-session-tabs"
                        activeKey={modalInnerTabKey}
                        onSelect={(k) => setModalInnerTabKey(k)}
                        className="mb-3"
                        justify
                    >
                        <Tab eventKey="aacSets" title="AAC 묶음">
                            {/* AAC 묶음 탭 내용 */}
                        </Tab>
                        <Tab eventKey="filter" title="필터 도구">
                            {/* 필터 도구 탭 내용 */}
                        </Tab>
                        <Tab eventKey="sessionSets" title="수업 세트">
                            {/* 수업 세트 탭 내용 */}
                        </Tab>
                        <Tab eventKey="fairyTale" title="동화 선택">
                            <div className="p-3">
                                <Form.Group className="mb-3">
                                    <Form.Label>동화 장르 선택</Form.Label>
                                    <Form.Select
                                        value={selectedClassification}
                                        onChange={(e) => setSelectedClassification(e.target.value)}
                                    >
                                        <option value="">장르를 선택하세요</option>
                                        {fairyTaleClassifications.map(c => <option key={c} value={c}>{c}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>동화 제목 선택</Form.Label>
                                    {!selectedClassification ? (
                                        <Alert variant="light">먼저 장르를 선택해주세요.</Alert>
                                    ) : fairyTaleTitles.length > 0 ? (
                                        <>
                                            <ListGroup className="fairy-tale-title-list mb-3">
                                                {paginatedFairyTaleTitles.map(title => (
                                                    <ListGroup.Item
                                                        key={title}
                                                        action
                                                        active={selectedTitle === title}
                                                        onClick={() => setSelectedTitle(title)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {title}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                            {totalFairyTalePages > 1 && (
                                                <div className="d-flex justify-content-center align-items-center">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => handleFairyTalePageChange(fairyTaleCurrentPage - 1)}
                                                        disabled={fairyTaleCurrentPage === 1}
                                                    >
                                                        이전
                                                    </Button>
                                                    <span className="mx-3">
                                                        {fairyTaleCurrentPage} / {totalFairyTalePages}
                                                    </span>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => handleFairyTalePageChange(fairyTaleCurrentPage + 1)}
                                                        disabled={fairyTaleCurrentPage === totalFairyTalePages}
                                                    >
                                                        다음
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Alert variant="light">해당 장르에 동화책이 없습니다.</Alert>
                                    )}
                                </Form.Group>

                                {selectedFairyTaleInfo && (
                                    <Card className="mt-3 p-3 shadow-sm">
                                        <Card.Title>{selectedFairyTaleInfo.title}</Card.Title>
                                        <Card.Text>총 페이지: {selectedFairyTaleInfo.maxPage} 페이지</Card.Text>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>시작 페이지</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={fairyTaleStartPage}
                                                        onChange={(e) => setFairyTaleStartPage(Math.max(selectedFairyTaleInfo.minPage, Math.min(parseInt(e.target.value), selectedFairyTaleInfo.maxPage)))}
                                                        min={selectedFairyTaleInfo.minPage}
                                                        max={selectedFairyTaleInfo.maxPage}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>끝 페이지</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={fairyTaleEndPage}
                                                        onChange={(e) => setFairyTaleEndPage(Math.max(fairyTaleStartPage, Math.min(parseInt(e.target.value), selectedFairyTaleInfo.maxPage)))}
                                                        min={fairyTaleStartPage}
                                                        max={selectedFairyTaleInfo.maxPage}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card>
                                )}
                            </div>
                        </Tab>
                    </Tabs>
                    <div className="mt-3 p-3 border-top">
                        <p>현재 수업에 선택된 도구 ({selectedToolsForSession.length}개) 및 동화:</p>
                        <div className="d-flex flex-wrap">
                            {selectedToolsForSession.length === 0 && !selectedFairyTaleInfo ? (
                                <Badge bg="secondary">선택된 항목이 없습니다.</Badge>
                            ) : (
                                <>
                                    {selectedToolsForSession.map(toolId => {
                                        const tool = allIndividualTools.find(t => t.id === toolId);
                                        return tool ? (
                                            <Badge key={toolId} bg={tool.type === 'AAC' ? 'primary' : 'success'} className="me-2 mb-2">
                                                {tool.name}
                                                <Button variant="link" className="p-0 ms-2 text-decoration-none" style={{ color: 'white', fontSize: '0.8em' }} onClick={() => handleToolSelectionInModal(toolId)}>&times;</Button>
                                            </Badge>
                                        ) : null;
                                    })}
                                    {selectedFairyTaleInfo && (
                                        <Badge bg="info" className="me-2 mb-2">
                                            {selectedFairyTaleInfo.title} ({fairyTaleStartPage}p ~ {fairyTaleEndPage}p)
                                            <Button variant="link" className="p-0 ms-2 text-decoration-none" style={{ color: 'white', fontSize: '0.8em' }} onClick={() => { setSelectedTitle(''); setSelectedFairyTaleInfo(null); }}>&times;</Button>
                                        </Badge>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowToolSelectionModal(false)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleCreateSessionRoom} disabled={selectedToolsForSession.length === 0 && !selectedFairyTaleInfo}>
                        수업 시작 (방 생성)
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default TherapistSchedulePage;
