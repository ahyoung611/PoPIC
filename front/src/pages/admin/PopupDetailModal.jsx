import PopupImage from "../../components/popupdetail/PopupImage.jsx";

const PopupDetailModal = ({popup, isOpen, onClose})=>{
    if (!isOpen) return null;


    return (
        <div className="popup-modal-backdrop" onClick={onClose}>
            <div
                className="popup-modal-content"
                onClick={(e) => e.stopPropagation()} // 배경 클릭시 닫히지 않도록
            >
                <button className="popup-close-btn" onClick={onClose}>
                    ✕
                </button>

                <h2 className="popup-title">{popup.store_name}</h2>

                <div className="popup-image">
                    <PopupImage images={popup.images} />
                </div>

                <div className="popup-info">
                    <div className="popup-row">
                        <h4 className="label">기간</h4>
                        <p className="value">
                          {popup.start_date} ~ {popup.end_date}
                        </p>
                    </div>
                    <div className="popup-row">
                        <h4 className="label">담당자</h4>
                        <p className="value">{popup.vendor.manager_name}</p>
                    </div>
                    <div className="popup-row">
                        <h4 className="label">전화번호</h4>
                        <p className="value">{popup.vendor.phone_number}</p>
                    </div>
                    <div className="popup-row">
                        <h4 className="label">카테고리</h4>
                        <p className="value">{popup.category_names}</p>
                    </div>
                    <div className="popup-row">
                        <h4 className="label">장소</h4>
                        <p className="value">
                          {popup.address} {popup.address_detail}
                        </p>
                    </div>
                </div>
                <div className="popup-row">
                    <h4 className={"label"}>팝업 소개</h4>
                    <p className={"value"}>{popup.description}</p>
                </div>
            </div>
        </div>
    );
}

export default PopupDetailModal;