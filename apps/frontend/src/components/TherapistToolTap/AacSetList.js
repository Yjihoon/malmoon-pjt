import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import './AacSetList.css'; // Import the new CSS file

const AacSetList = ({ aacSets, onEdit, onDelete }) => {
    if (!aacSets || aacSets.length === 0) {
        return (
            <div className="empty-list-placeholder">
                <h5>아직 AAC 묶음이 없어요</h5>
                <p>새로운 AAC 묶음을 추가하여 관리해보세요.</p>
            </div>
        );
    }

    return (
        <div className="aac-set-list-container">
            <ListGroup className="aac-set-list-group">
                {aacSets.map(set => (
                    <ListGroup.Item key={set.id} className="aac-set-list-item">
                        <div className="aac-set-text-content"> {/* New class for text content */}
                        <h5 className="aac-set-item-title">{set.name}</h5>
                        <p className="aac-set-item-description">{set.description}</p>
                    </div>
                    <div className="aac-set-actions">
                        <Button className="aac-set-edit-btn" onClick={() => onEdit(set)}>편집</Button>
                        <Button className="aac-set-delete-btn" onClick={() => onDelete(set.id)}>삭제</Button>
                    </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default AacSetList;
