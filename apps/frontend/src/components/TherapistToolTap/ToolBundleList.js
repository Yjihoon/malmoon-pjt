import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import './ToolBundleList.css';

const ToolBundleList = ({ toolBundles, allAacSets, allFilterSets, onEdit, onDelete }) => {
    if (!toolBundles || toolBundles.length === 0) {
        return (
            <div className="empty-list-placeholder">
                <h5>아직 수업 세트가 없어요</h5>
                <p>새로운 수업 세트를 추가하여 관리해보세요.</p>
            </div>
        );
    }
    
    const findNameById = (list, id, key, nameKey) => {
        const item = list.find(i => i[key] === id);
        return item ? item[nameKey] : '알 수 없음';
    };

    const BundleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-box-seam item-title-icon" viewBox="0 0 16 16">
            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
        </svg>
    );
    const AacIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L6 4.293V1a.5.5 0 0 1 .5-.5zm.5 5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zM.5 7.5A.5.5 0 0 1 1 7h4a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zm0 2A.5.5 0 0 1 1 9h2a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zm0 2A.5.5 0 0 1 1 11h4a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zm10-2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zM1 1.5A1.5 1.5 0 0 1 2.5 0h11A1.5 1.5 0 0 1 15 1.5v13A1.5 1.5 0 0 1 13.5 16h-11A1.5 1.5 0 0 1 1 14.5v-13zM2.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-11z"/></svg>);
    const FilterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0V2.5a.5.5 0 0 1 .5-.5zM10.354 1.146a.5.5 0 0 1 0 .708L5.707 6.5l4.647 4.646a.5.5 0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708 0zM4.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0V2.5a.5.5 0 0 1 .5-.5z"/></svg>);


    return (
        <div className="tool-bundle-list-container">
            <div className="tool-bundle-list-group">
                {toolBundles.map(bundle => (
                    <div key={bundle.toolBundleId} className="tool-bundle-list-item">
                        <div className="list-item-content">
                            <div className="tool-bundle-text-content">
                                <div className="item-title-container">
                                    <BundleIcon />
                                    <h5 className="tool-bundle-item-title">{bundle.name}</h5>
                                </div>
                                <p className="tool-bundle-item-description">{bundle.description}</p>
                                
                                <div className="tool-bundle-details">
                                    {bundle.aacSetId && (
                                        <div className="bundle-detail-item">
                                            <AacIcon />
                                            <span>
                                                <Badge>
                                                    {findNameById(allAacSets, bundle.aacSetId, 'id', 'name')}
                                                </Badge>
                                            </span>
                                        </div>
                                    )}
                                    {bundle.filterSetId && (
                                        <div className="bundle-detail-item">
                                            <FilterIcon />
                                            <span>
                                                <Badge>
                                                    {findNameById(allFilterSets, bundle.filterSetId, 'filterSetId', 'name')}
                                                </Badge>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="tool-bundle-actions">
                                <Button className="btn-tool-edit" onClick={() => onEdit(bundle)}>편집</Button>
                                <Button className="btn-tool-delete" onClick={() => onDelete(bundle.toolBundleId)}>삭제</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToolBundleList;