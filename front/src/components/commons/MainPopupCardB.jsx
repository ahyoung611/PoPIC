import React from "react";
import MainPopupCardImg from "./MainPopupCardImg.jsx";

export default function MainPopupCardB({
                                         popupId, alt, category,
                                         title, periodText,
                                         bookmarked, onToggleBookmark,
                                         onClick
                                       }) {


        return (
         <div className={`popup-card mpc-card mpc-card--typeB`} role="button" onClick={onClick}>
            <MainPopupCardImg
                className="popup-card"
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
        </div>
    );
}
