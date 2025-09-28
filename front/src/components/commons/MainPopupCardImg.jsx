import React from "react";
import { useAuth } from "../../context/AuthContext";
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
    const { auth } = useAuth();
    const userId = auth?.user?.user_id;
    const token = auth?.token;

   const handleBookmarkClick = async (e) => {
       e.preventDefault();
       e.stopPropagation();

       if (!userId) {
           console.error("로그인 필요");
           return;
       }
    const next = !bookmarked;
     onToggleBookmark?.(Number(popupId), next);
   };

    const [popup, setPopup] = useState(null);

   useEffect(() => {
           const fetchPopupDetails = async () => {
               try {
                   const res = await apiRequest(`/popupStore/popupDetail?id=${popupId}`);
                   setPopup(res);
               } catch (err) {
                   console.error("팝업 정보 로딩 실패", err);
               }
           };
           fetchPopupDetails();
       }, [popupId]);


    const id = popup?.images?.[0] || 12;

    return (
        <div className="mpc-media" style={{ aspectRatio: aspect }}>
            <img
                className="mpc-media__img"
                src={"http://localhost:8080/images?type=popup&id=" + id }
                alt={alt}
                loading="lazy"
            />

            {/* 카테고리 */}
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
                  aria-label={bookmarked ? "북마크 해제" : "북마크"}
                  aria-pressed={bookmarked}
                  onClick={handleBookmarkClick}
              >
                  <img
                      className="mpc-media__bookmark-icon"
                      src={bookmarked ? bookmarkIconActive : bookmarkIcon}
                      alt={bookmarked ? "북마크 ON" : "북마크 OFF"}
                      draggable="false"
                  />
              </button>
            ) : null}
        </div>
    );
}
