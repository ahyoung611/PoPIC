import React from "react";
import Button from "./Button";
import "../../style/SearchHeader.css";

export default function SearchHeader({
  searchValue = "",
  onSearchChange,
  onSearchClick,
  onRegisterClick,
  showRegister,
  placeholder = "검색어 입력하세요",
  className = "",
}) {
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

      {/* 검색 버튼 (Enter로 동작) */}
      <Button type="submit" variant="primary" color="red" aria-label="검색">
        검색
      </Button>

      {/* 등록 버튼 */}
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
