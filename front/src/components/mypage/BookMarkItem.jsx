import React, { useState, useEffect } from "react";
import "../../style/bookmark.css";
import Button from "../commons/Button.jsx";

export default function BookMarkItem({
  item,
  onToggleLike,
  onOpenDetail,
  aspect = "1/1",
  bookmarkIcon = "/heart-off.png",
  bookmarkIconActive = "/heart-on.png",
}) {
  const [isBookmarked, setIsBookmarked] = useState(!!item.liked);

  useEffect(() => {
    setIsBookmarked(!!item.liked);
  }, [item.liked]);

  const handleOpen = () => onOpenDetail?.(item.id);

  const handleToggleLike = (e) => {
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
    onToggleLike?.(item.id);
  };

  return (
    <article className="bookmark-item" role="button" onClick={handleOpen}>
      <div className="bookmark-item__thumb">
        <img
          className="bookmark-item__img"
          src={item.thumbnailUrl}
          alt={item.title || "thumbnail"}
          loading="lazy"
          draggable="false"
        />
      </div>

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

      <div className="bookmark-item__actions" onClick={(e) => e.stopPropagation()}>
        <button
        type="button"
        className={`bookmark-item__heart ${isBookmarked ? "is-active" : ""}`}
        aria-label={isBookmarked ? "북마크 해제" : "북마크"}
        aria-pressed={isBookmarked}
        onClick={handleToggleLike}
        >
        <img
          className="bookmark-item__heart-icon"
          src={isBookmarked ? bookmarkIconActive : bookmarkIcon}
          alt={isBookmarked ? "북마크 ON" : "북마크 OFF"}
          draggable="false"
         />
        </button>
        <Button
          variant="ghost" color="gray"
          aria-label="상세 보기"
          onClick={handleOpen}
        >
          상세 보기 →
        </Button>
      </div>
    </article>
  );
}