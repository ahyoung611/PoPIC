import React, {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import "../../style/mainPopupCard.css";
import apiRequest from "../../utils/apiRequest";
import ConfirmModal from "./ConfirmModal.jsx";
import {useNavigate} from "react-router-dom";

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
    const {auth} = useAuth();
    const userId = auth?.user?.user_id;
    const token = auth?.token;
    const nav = useNavigate();

    const [isBookmarked, setIsBookmarked] = useState(bookmarked);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        setIsBookmarked(bookmarked);
    }, [bookmarked]);

    const handleBookmarkClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            setModalOpen(true);
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
        <div className="mpc-media" style={{aspectRatio: aspect}}>
            <img
                className="mpc-media__img"
                src={popup?.thumb}
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
            <ConfirmModal
                open={modalOpen}
                title="로그인이 필요합니다"
                description="게시판을 이용하려면 로그인 해주세요."
                okText="로그인 하러가기"
                cancelText="취소"
                onConfirm={() => {
                    setModalOpen(false);
                    nav("/login");
                }}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}
