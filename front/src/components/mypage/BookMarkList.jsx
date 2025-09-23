import React from 'react';
import FavoriteItem from './BookMarkItem.jsx';
import Select from "../commons/Select.jsx";

export default function BookMarkList({ items, loading, sort, onSortChange, onToggleLike, onOpenDetail }) {
    return (
        <section>
            <div className="section-title">
                <span>내가 찜한 목록</span>
                <div className="sort">
                    <Select
                        options={[{ label: "최신순", value: "latest" }, { label: "오래된순", value: "oldest" }]}
                        value={sort}
                        onChange={onSortChange}
                    />
                </div>
            </div>

            {loading ? (
                <div className="favorite-list">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="favorite-item">
                            <div className="skeleton" style={{ width:120, height:90 }} />
                            <div>
                                <div className="skeleton" style={{ width:260, height:18, marginBottom:8 }} />
                                <div className="skeleton" style={{ width:180, height:14 }} />
                            </div>
                            <div className="skeleton" style={{ width:80, height:20 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="favorite-list">
                    {items.length === 0 ? (
                        <div style={{ color:'#888' }}>찜한 팝업이 없습니다.</div>
                    ) : (
                        items.map((it) => (
                            <FavoriteItem
                                key={it.id}
                                item={it}
                                onToggleLike={onToggleLike}
                                onOpenDetail={onOpenDetail}
                            />
                        ))
                    )}
                </div>
            )}
        </section>
    );
}
