import React, { useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
  Pagination,
  Accordion,
  ListGroup,
} from "react-bootstrap";

const AacItemList = ({ aacItems, onEdit, onDelete, onViewDetails, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const itemsPerPage = 12;

  // [수정 및 로그 추가] 잘못된 중복 URL과 한글/공백 문제를 해결하고 경로를 확인하는 함수
  const getCorrectUrl = (url, itemName) => {
    // --- [콘솔 로그 추가] ---
    console.log(`[AacItemList - ${itemName}] 원본 URL:`, url);
    // ------------------------

    if (!url || typeof url !== 'string') {
      return null;
    }
    let correctedUrl = url;
    // URL이 'https://'로 여러 번 시작하는 경우, 마지막 'https://' 부분만 사용
    if ((url.match(/https:\/\//g) || []).length > 1) {
      const lastIndex = url.lastIndexOf('https://');
      correctedUrl = url.substring(lastIndex);
    }
    
    const finalUrl = encodeURI(correctedUrl);
    // --- [콘솔 로그 추가] ---
    console.log(`[AacItemList - ${itemName}] 최종 URL:`, finalUrl);
    // ------------------------
    return finalUrl;
  };

  const categories = useMemo(() => {
    if (!aacItems) return {};
    const initialCategories = aacItems.reduce((acc, item) => {
      const { situation, action } = item;
      if (!acc[situation]) acc[situation] = new Set();
      if (action) acc[situation].add(action);
      return acc;
    }, {});
    return Object.keys(initialCategories)
      .sort()
      .reduce((obj, key) => {
        obj[key] = Array.from(initialCategories[key]).sort();
        return obj;
      }, {});
  }, [aacItems]);

  const filteredItems = useMemo(() => {
    if (!aacItems) return [];

    const checkVisibility = (item) => {
      if (!currentUser) return false; 
      if (item.status === "PUBLIC" || item.status === "DEFAULT") {
        return true;
      }
      if (item.status === "PRIVATE" && item.therapistId === currentUser.memberId) {
        return true;
      }
      return false;
    };

    if (!selectedSituation) {
      return aacItems.filter((item) => {
        const searchMatch =
          !searchTerm ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch && checkVisibility(item);
      });
    }

    return aacItems.filter((item) => {
      const matchesSituation = item.situation === selectedSituation;
      const matchesAction = !selectedAction || item.action === selectedAction;
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return (
        matchesSituation &&
        matchesAction &&
        matchesSearch &&
        checkVisibility(item)
      );
    });
  }, [aacItems, searchTerm, selectedSituation, selectedAction, currentUser]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAccordionSelect = (eventKey) => {
    setActiveKey(eventKey);
    const situation = eventKey
      ? Object.keys(categories)[parseInt(eventKey, 10)]
      : null;
    setSelectedSituation(situation);
    setSelectedAction(null);
    setCurrentPage(1);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setCurrentPage(1);
  };

  const clearCategory = () => {
    setActiveKey(null);
    setSelectedSituation(null);
    setSelectedAction(null);
    setCurrentPage(1);
  };

  const canModify = (item) => {
      if (!currentUser || item.status === 'DEFAULT') {
          return false;
      }
      return item.therapistId === currentUser.memberId;
  }

  const handleEditClick = (e, item) => {
      e.stopPropagation();
      onEdit(item);
  }

  const handleDeleteClick = (e, itemId) => {
      e.stopPropagation();
      onDelete(itemId);
  }

  return (
    <Row>
      <Col md={3}>
        <h5 className="mb-3">카테고리</h5>
        <Button
          variant="outline-secondary"
          size="sm"
          className="w-100 mb-2"
          onClick={clearCategory}
        >
          전체 보기
        </Button>
        <Accordion activeKey={activeKey} onSelect={handleAccordionSelect}>
          {Object.keys(categories).map((situation, index) => (
            <Accordion.Item eventKey={index.toString()} key={situation}>
              <Accordion.Header>{situation}</Accordion.Header>
              <Accordion.Body>
                <ListGroup variant="flush">
                  {categories[situation].map((action) => (
                    <ListGroup.Item
                      key={action}
                      action
                      active={
                        selectedSituation === situation &&
                        selectedAction === action
                      }
                      onClick={() => handleActionSelect(action)}
                    >
                      {action}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Col>
      <Col md={9}>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="아이템 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>
        {currentItems.length > 0 ? (
          <Row xs={2} md={3} lg={4} className="g-3">
            {currentItems.map((item) => (
              <Col key={item.id}>
                <Card className="h-100" onClick={() => onViewDetails(item)} style={{ cursor: 'pointer' }}>
                  <Card.Img
                    variant="top"
                    src={
                      getCorrectUrl(item.fileId, item.name) || 
                      "https://placehold.co/150x150?text=No+Image"
                    }
                    style={{ height: "120px", objectFit: "cover" }}
                  />
                  <Card.Body className="p-2 d-flex flex-column">
                    <Card.Title
                      as="h6"
                      className="flex-grow-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {item.name}
                    </Card.Title>
                    <div className="mt-auto text-center">
                      {canModify(item) && (
                        <>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-1"
                            onClick={(e) => handleEditClick(e, item)}
                          >
                            편집
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, item.id)}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center p-5 border rounded">
            <p className="text-muted">표시할 아이템이 없습니다.</p>
          </div>
        )}
        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-4">
            <Pagination.Prev
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Pagination.Item
                key={num}
                active={num === currentPage}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </Col>
    </Row>
  );
};

export default AacItemList;
