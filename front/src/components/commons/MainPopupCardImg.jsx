import React from "react";
import "../../style/mainPopupCard.css";
import apiRequest from "../../utils/apiRequest";
import {useState, useEffect} from "react";

export default function MainPopupCardImg({
                                             popupId,
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
    const [popup, setPopup] = useState(null);

    const fetchPopup = async()=>{
            const res = await apiRequest(`/popupStore/popupDetail?id=${popupId}`)
//             console.log("res", res);
            setPopup(res);
        }
    useEffect(()=>{
    fetchPopup();
    },[])

    const id = popup?.images?.[0] || 12;

    return (
        <div className="mpc-media" style={{ aspectRatio: aspect }}>
            <img
                className="mpc-media__img"
                src={"http://localhost:8080/images?type=popup&id=" + id }
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
