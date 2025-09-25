// MainPopupCardA.jsx
import React from "react";
import "../../style/mainPopupCard.css";
import MainPopupCardImg from "./MainPopupCardImg.jsx";

export default function MainPopupCardA({
                                           popupId, alt, category,
                                           title, periodText,
                                           bookmarked, onToggleBookmark,
                                           onClick
                                       }) {
//                                            console.log("popupId", popupId);

    return (
         <div className="mpc-card mpc-card--typeA" onClick={onClick}>
            <MainPopupCardImg
                popupId={popupId}
                alt={alt}
                category={category}
                bookmarked={bookmarked}
                onToggleBookmark={onToggleBookmark}
                aspect="4/5"
            />
            <div className="mpc-card__body">
                <p className="mpc-card__period">{periodText}</p>
                <hr className="mpc-card__divider" />
                <h3 className="mpc-card__title">{title}</h3>
            </div>
        </div>
    );
}
