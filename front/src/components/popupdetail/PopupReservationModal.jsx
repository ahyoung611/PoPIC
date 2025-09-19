import "../../style/modal.css";

import React from "react";

const PopupReservationModal = ({ isOpen, onClose, reservationData }) => {
    if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 반환하지 않음

    return (
        <div className="modalMask reservationModal" onClick={onClose}>
            <div className="modalPanel" onClick={(e) => e.stopPropagation()}>
                <h2 className="modalTitle">예약 정보</h2>

                <div className="reservationList">
                    <p><strong>팝업 이름 </strong> {reservationData.name}</p>
                    <p><strong>예약 날짜 </strong> {reservationData.date}</p>
                    <p><strong>예약 시간 </strong> {reservationData.time}</p>
                    <p><strong>인원 </strong> {reservationData.numberOfPeople}명</p>
                    <p><strong>금액 </strong> <span className="price">{reservationData.price}</span></p>
                </div>

                <div className="modalActions">
                    <button className="modalBtn btnPay">결제</button>
                    <button className="modalBtn btnGhost" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default PopupReservationModal;
