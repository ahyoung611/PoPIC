import React from "react";
import Button from "./Button";
import "../../style/SearchHeader.css";

export default function SearchHeader({
                                         searchValue = "",
                                         onSearchChange,
                                         onSearchClick,
                                         onRegisterClick,
                                     }) {
    return (
        <div className="search-header">
            {/* 검색창 */}
            <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="상품명을 입력하세요"
            />

            {/* 검색 버튼 */}
            <Button variant="primary" color="red" onClick={onSearchClick}>
                검색
            </Button>

            {/* 등록 버튼 */}
            <Button variant="outline" color="gray" onClick={onRegisterClick}>
                등록
            </Button>
        </div>
    );
}
