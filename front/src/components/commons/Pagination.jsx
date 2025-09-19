import React from "react";
import Button from "../commons/Button";
import "../../style/Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // 범위를 벗어나는 이동/중복 이동 방지
    const go = (p) => {
        if (p < 1 || p > totalPages || p === currentPage) return;
        onPageChange(p);
    };

    return (
        <div>
           <nav className="pagination" role="navigation" aria-label="페이지네이션">
            {/* 이전 */}
            <Button
                variant="outline"
                color="gray"
                disabled={currentPage === 1}
                onClick={() => go(currentPage - 1)}
                aria-label="이전 페이지"
            >
                &lsaquo;
            </Button>

            {/* 페이지 번호 */}
            {pages.map((page) => {
                const active = currentPage === page;
                return (
                    <Button
                        key={page}
                        variant="outline"
                        color="gray"
                        selected={active}
                        className={active ? "pagination__active" : ""}
                        onClick={() => go(page)}
                        aria-current={active ? "page" : undefined}
                        aria-label={`${page} 페이지`}
                    >
                        {page}
                    </Button>
                );
            })}

            {/* 다음 */}
            <Button
                variant="outline"
                color="gray"
                disabled={currentPage === totalPages}
                onClick={() => go(currentPage + 1)}
                aria-label="다음 페이지"
            >
                &rsaquo;
            </Button>
        </nav>
        </div>
    );
};

export default Pagination;
