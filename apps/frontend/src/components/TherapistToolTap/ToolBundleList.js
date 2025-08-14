import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import './ToolBundleList.css'; // Import the new CSS file

const ToolBundleList = ({ toolBundles, allAacSets, allFilterSets, onEdit, onDelete }) => {
    if (!toolBundles || toolBundles.length === 0) {
        return (
            <div className="empty-list-placeholder">
                <h5>아직 수업 세트가 없어요</h5>
                <p>새로운 수업 세트를 추가하여 관리해보세요.</p>
            </div>
        );
    }

    // ID를 기반으로 이름 찾기 위한 헬퍼 함수
    const findNameById = (list, id, key, nameKey) => {
        const item = list.find(i => i[key] === id);
        return item ? item[nameKey] : '알 수 없음';
    };

    return (
        <div className="tool-bundle-list-container">
            <ListGroup className="tool-bundle-list-group">
                {toolBundles.map(bundle => (
                    <ListGroup.Item key={bundle.toolBundleId} className="tool-bundle-list-item">
                    <div className="tool-bundle-text-content"> {/* New class for text content */}
                        <h5 className="tool-bundle-item-title">{bundle.name}</h5>
                        <p className="tool-bundle-item-description">{bundle.description}</p>
                        
                        {bundle.aacSetId && (
                            <>
                                <strong>포함된 AAC 묶음:</strong>
                                <div className="mb-2">
                                    <Badge className="tool-bundle-badge">
                                        {findNameById(allAacSets, bundle.aacSetId, 'id', 'name')}
                                    </Badge>
                                </div>
                            </>
                        )}

                        {bundle.filterSetId && (
                            <>
                                <strong>포함된 필터 묶음:</strong>
                                <div>
                                    <Badge className="tool-bundle-badge">
                                        {findNameById(allFilterSets, bundle.filterSetId, 'filterSetId', 'name')}
                                    </Badge>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="tool-bundle-actions">
                        <Button className="tool-bundle-edit-btn" onClick={() => onEdit(bundle)}>편집</Button>
                        <Button className="tool-bundle-delete-btn" onClick={() => onDelete(bundle.toolBundleId)}>삭제</Button>
                    </div>
                </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default ToolBundleList;
