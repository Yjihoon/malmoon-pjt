import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

const AacSetList = ({ aacSets, onEdit, onDelete }) => {
    if (!aacSets || aacSets.length === 0) {
        return <p className="text-muted text-center">생성된 AAC 묶음이 없습니다.</p>;
    }

    return (
        <ListGroup>
            {aacSets.map(set => (
                <ListGroup.Item key={set.ACC_set_id}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{set.name}</h5>
                            <p className="text-muted mb-2">{set.description}</p>
                            {/* 상세 아이템 목록 표시는 제거합니다.
                                /my API는 아이템 목록을 포함하지 않기 때문입니다.
                                필요 시, 상세 조회 API를 호출하여 구현할 수 있습니다.
                            */}
                        </div>
                        <div className="ms-3">
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => onEdit(set)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(set.ACC_set_id)}>삭제</Button>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default AacSetList;
