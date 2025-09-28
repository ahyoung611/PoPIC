import React, { useState, useEffect } from "react";
import "../../style/bookmark-item.css";

export default function BookMarkItem({
  item,
  onToggleLike,
  onOpenDetail,
  aspect = "1/1", // 썸네일 비율
  bookmarkIcon = "/heart-off.png",
  bookmarkIconActive = "/heart-on.png",
}) {
  // 내부 상태로 liked 관리 → prop 변경 시 동기화
  const [isBookmarked, setIsBookmarked] = useState(!!item.liked);

  useEffect(() => {
    setIsBookmarked(!!item.liked);
  }, [item.liked]);

  const handleOpen = () => onOpenDetail?.(item.id);

  const handleToggleLike = (e) => {
    e.stopPropagation(); // 카드 클릭과 분리
    setIsBookmarked((prev) => !prev); // UI 즉시 반영
    onToggleLike?.(item.id);          // 부모 상태 업데이트
  };

    useEffect(() => {
        setIsBookmarked(!!item.liked);
    }, [item.liked]);

  return (
    <article className="bookmark-item" role="button" onClick={handleOpen}>
      {/* 썸네일 */}
      <div className="bookmark-item__thumb" style={{ aspectRatio: aspect }}>
        <img
          className="bookmark-item__img"
          src={item.thumbnailUrl}
          alt={item.title || "thumbnail"}
          loading="lazy"
          draggable="false"
        />
      </div>

      {/* 본문 */}
      <div className="bookmark-item__body">
        <h3 className="bookmark-item__title" title={item.title}>
          {item.title}
        </h3>

        {item.periodText ? (
          <p className="bookmark-item__period">{item.periodText}</p>
        ) : null}

        <div className="bookmark-item__meta">
          {item.tag ? <span className="bookmark-item__badge">{item.tag}</span> : null}
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="bookmark-item__actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="bookmark-item__link"
          aria-label="상세 보기"
          onClick={handleOpen}
        >
          상세 보기 →
        </button>

        <button
          type="button"
          className={`bookmark-item__heart ${isBookmarked ? "is-active" : ""}`}
          aria-label={isBookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
          aria-pressed={isBookmarked}
          onClick={handleToggleLike}
        >
          <img
            className="bookmark-item__heart-icon"
            src={isBookmarked ? bookmarkIconActive : bookmarkIcon}
            alt={isBookmarked ? "즐겨찾기 ON" : "즐겨찾기 OFF"}
            draggable="false"
          />
        </button>
      </div>
    </article>
  );
}