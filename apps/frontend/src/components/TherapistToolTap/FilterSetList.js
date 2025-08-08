import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

/**
 * 필터 묶음 목록을 표시하는 컴포넌트입니다.
 * @param {object} props - filterSets, onEdit, onDelete를 포함하는 객체
 */
const FilterSetList = ({ filterSets, onEdit, onDelete }) => {
    if (!filterSets || filterSets.length === 0) {
        return <p className="text-muted text-center">생성된 필터 묶음이 없습니다.</p>;
    }

    return (
        <ListGroup>
            {filterSets.map(set => (
                <ListGroup.Item key={set.filterSetId}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{set.name}</h5>
                            <p className="text-muted mb-2">{set.description}</p>
                        </div>
                        <div className="ms-3">
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => onEdit(set)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(set.filterSetId)}>삭제</Button>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default FilterSetList;
