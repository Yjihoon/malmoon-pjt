import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';

const AacSetList = ({ aacSets, aacItems, onEdit, onDelete }) => {
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
                            <div>
                                {(set.aac_item_ids || []).slice(0, 5).map(itemId => {
                                    const item = aacItems.find(t => t.id === itemId);
                                    return item ? <Badge pill bg="info" className="me-1" key={itemId}>{item.name}</Badge> : null;
                                })}
                                {(set.aac_item_ids || []).length > 5 && <Badge pill bg="secondary">+{set.aac_item_ids.length - 5}개 더</Badge>}
                            </div>
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
