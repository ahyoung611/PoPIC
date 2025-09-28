import React, { useState, useMemo } from 'react';
import BookMarkItem from './BookMarkItem.jsx';
import Select from "../commons/Select.jsx";
import Pagination from '../commons/Pagination.jsx';

export default function BookMarkList({ items, loading, sort, onSortChange, onToggleLike, onOpenDetail }) {
    const ITEMS_PER_PAGE = 5; // 한 페이지당 보여줄 아이템 수
    const [currentPage, setCurrentPage] = useState(1);

    // 정렬된 아이템
    const sortedItems = useMemo(() => {
        if (sort === "latest") {
            return [...items].sort((a, b) => b.id - a.id);
        } else {
            return [...items].sort((a, b) => a.id - b.id);
        }
    }, [items, sort]);

    // 현재 페이지에 보여줄 아이템
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return sortedItems.slice(start, end);
    }, [sortedItems, currentPage]);

    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

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
                            <div className="skeleton" />
                            <div>
                                <div className="skeleton" />
                                <div className="skeleton" />
                            </div>
                            <div className="skeleton" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="favorite-list">
                    {currentItems.length === 0 ? (
                        <div className="nonList">찜한 팝업이 없습니다.</div>
                    ) : (
                        currentItems.map((it) => (
                            <BookMarkItem
                                key={it.id}
                                item={it}
                                onToggleLike={onToggleLike}
                                onOpenDetail={onOpenDetail}
                            />
                        ))
                    )}
                </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </section>
    );
}
