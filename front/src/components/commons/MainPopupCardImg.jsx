import React from "react";
import "../../style/mainPopupCard.css";

export default function MainPopupCardImg({
                                             image,
                                             alt = "",
                                             category,
                                             bookmarked = false,
                                             onToggleBookmark,
                                             aspect = "4/5",
                                             bookmarkIcon = "/heart-off.png",
                                             bookmarkIconActive = "/heart-on.png",
                                             showBookmark = true,
                                         }) {
    const handleBookmarkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleBookmark?.();
    };

    return (
        <div className="mpc-media" style={{ aspectRatio: aspect }}>
            <img
                className="mpc-media__img"
                src={image}
                alt={alt}
                loading="lazy"
            />

            {/* 카테고리 배지 (옵션) */}
            {category ? (
                <span
                    className="mpc-media__badge"
                    aria-label={`카테고리 ${category}`}
                >
          {category}
        </span>
            ) : null}

            {showBookmark && (bookmarkIcon || bookmarkIconActive) ? (
                <button
                    type="button"
                    className={`mpc-media__bookmark ${bookmarked ? "is-active" : ""}`}
                    aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
                    aria-pressed={bookmarked}
                    onClick={handleBookmarkClick}
                >
                    <img
                        className="mpc-media__bookmark-icon"
                        src={bookmarked ? bookmarkIconActive : bookmarkIcon}
                        alt={bookmarked ? "즐겨찾기 ON" : "즐겨찾기 OFF"}
                        draggable="false"
                    />
                </button>
            ) : null}
        </div>
    );
}
