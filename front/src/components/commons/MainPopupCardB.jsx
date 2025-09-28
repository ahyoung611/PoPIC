// MainPopupCardB.jsx
import React from "react";
import "../../style/mainPopupCard.css";
import MainPopupCardImg from "./MainPopupCardImg.jsx";

export default function MainPopupCardB({
                                            popupId, alt, category,
                                            title, periodText,
                                            bookmarked, onToggleBookmark,
                                            onClick
                                       }) {
    return (
        <a href={href} className="mpc-card mpc-card--typeB" onClick={onClick}>
            <MainPopupCardImg
                   popupId={popupId}
                   alt={alt}
                   category={category}
                   bookmarked={bookmarked}
                   onToggleBookmark={onToggleBookmark}
                   aspect="4/5"
               />
            <div className="mpc-card__body">
                <h3 className="mpc-card__title">{title}</h3>
                <p className="mpc-card__period">{periodText}</p>
            </div>
        </a>
    );
}
