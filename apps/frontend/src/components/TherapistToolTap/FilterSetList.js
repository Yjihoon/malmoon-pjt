import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import './FilterSetList.css'; // Import the new CSS file

/**
 * 필터 묶음 목록을 표시하는 컴포넌트입니다.
 * @param {object} props - filterSets, onEdit, onDelete를 포함하는 객체
 */
const FilterSetList = ({ filterSets, onEdit, onDelete }) => {
    if (!filterSets || filterSets.length === 0) {
        return (
            <div className="empty-list-placeholder">
                <h5>아직 필터 묶음이 없어요</h5>
                <p>새로운 필터 묶음을 추가하여 관리해보세요.</p>
            </div>
        );
    }

    return (
        <div className="filter-set-list-container">
            <ListGroup className="filter-set-list-group">
                {filterSets.map(set => (
                    <ListGroup.Item key={set.filterSetId} className="filter-set-list-item">
                    <div className="filter-set-text-content"> {/* New class for text content */}
                        <h5 className="filter-set-item-title">{set.name}</h5>
                        <p className="filter-set-item-description">{set.description}</p>
                    </div>
                    <div className="filter-set-actions">
                        <Button className="filter-set-edit-btn" onClick={() => onEdit(set)}>편집</Button>
                        <Button className="filter-set-delete-btn" onClick={() => onDelete(set.filterSetId)}>삭제</Button>
                    </div>
                </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default FilterSetList;
