import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';

const ToolBundleList = ({ toolBundles, allAacSets, allFilterSets, onEdit, onDelete }) => {
    if (!toolBundles || toolBundles.length === 0) {
        return <p className="text-muted text-center">생성된 수업 세트가 없습니다.</p>;
    }

    // ID를 기반으로 이름 찾기 위한 헬퍼 함수
    const findNameById = (list, id, key, nameKey) => {
        const item = list.find(i => i[key] === id);
        return item ? item[nameKey] : '알 수 없음';
    };

    return (
        <ListGroup>
            {toolBundles.map(bundle => (
                <ListGroup.Item key={bundle.toolBundleId}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{bundle.name}</h5>
                            <p className="text-muted">{bundle.description}</p>
                            
                            {bundle.aacSetId && (
                                <>
                                    <strong>포함된 AAC 묶음:</strong>
                                    <div className="mb-2">
                                        <Badge bg="primary" className="me-1">
                                            {findNameById(allAacSets, bundle.aacSetId, 'id', 'name')}
                                        </Badge>
                                    </div>
                                </>
                            )}

                            {bundle.filterSetId && (
                                <>
                                    <strong>포함된 필터 묶음:</strong>
                                    <div>
                                        <Badge bg="success" className="me-1">
                                            {findNameById(allFilterSets, bundle.filterSetId, 'filterSetId', 'name')}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="ms-3">
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => onEdit(bundle)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(bundle.toolBundleId)}>삭제</Button>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ToolBundleList;
