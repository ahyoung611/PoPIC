import React from "react";
import Button from "./Button";
import "../../style/SearchHeader.css";

export default function SearchHeader({
  searchValue = "",
  onSearchChange,
  onSearchClick,
  onRegisterClick,          // 있을 수도/없을 수도
  showRegister,             // (옵션) 명시적으로 표시 여부 제어
  placeholder = "상품명을 입력하세요",
  className = "",
}) {
  // showRegister가 boolean이면 그대로, 아니면 onRegisterClick 유무로 판단
  const shouldShowRegister =
    typeof showRegister === "boolean" ? showRegister : !!onRegisterClick;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchClick?.();
  };

  return (
    <form className={`search-header ${className}`} onSubmit={handleSubmit} role="search">
      {/* 검색창 */}
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label="검색어 입력"
      />

      {/* 검색 버튼 (Enter로도 동작) */}
      <Button type="submit" variant="primary" color="red" aria-label="검색">
        검색
      </Button>

      {/* 등록 버튼 (옵션) */}
      {shouldShowRegister && (
        <Button
          type="button"
          variant="outline"
          color="gray"
          onClick={onRegisterClick}
          aria-label="등록"
        >
          등록
        </Button>
      )}
    </form>
  );
}
