import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';

const ToolBundleList = ({ toolBundles, aacSets, filters, onEdit, onDelete }) => {
    if (!toolBundles || toolBundles.length === 0) {
        return <p className="text-muted text-center">생성된 수업 세트가 없습니다.</p>;
    }

    return (
        <ListGroup>
            {toolBundles.map(bundle => (
                <ListGroup.Item key={bundle.id}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{bundle.name}</h5>
                            <p className="text-muted">{bundle.description}</p>
                            <strong>포함된 AAC 묶음:</strong>
                            <div className="mb-2">
                                {(bundle.AAC_set_id || []).map(setId => {
                                    const set = aacSets.find(s => s.ACC_set_id === setId);
                                    return set ? <Badge bg="primary" className="me-1" key={setId}>{set.name}</Badge> : null;
                                })}
                            </div>
                            <strong>포함된 필터:</strong>
                            <div>
                                {(bundle.filter_id || []).map(filterId => {
                                    const filter = filters.find(f => f.id === filterId);
                                    return filter ? <Badge bg="success" className="me-1" key={filterId}>{filter.name}</Badge> : null;
                                })}
                            </div>
                        </div>
                        <div className="ms-3">
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => onEdit(bundle)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(bundle.id)}>삭제</Button>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ToolBundleList;
