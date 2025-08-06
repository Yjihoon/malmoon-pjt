import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

const AacSetList = ({ aacSets, onEdit, onDelete }) => {
    if (!aacSets || aacSets.length === 0) {
        return <p className="text-muted text-center">생성된 AAC 묶음이 없습니다.</p>;
    }

    return (
        <ListGroup>
            {aacSets.map(set => (
                <ListGroup.Item key={set.id}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{set.name}</h5>
                            <p className="text-muted mb-2">{set.description}</p>
                        </div>
                        <div className="ms-3">
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => onEdit(set)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(set.id)}>삭제</Button>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default AacSetList;
