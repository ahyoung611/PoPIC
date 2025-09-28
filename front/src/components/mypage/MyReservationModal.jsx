import React from "react";
import "../../style/MyReservationModal.css";
import QrCode from "../qr/QrCode.jsx";

const MyReservationModal = ({ open, onClose, reservation }) => {

    const formatStatus = (status) => {
        if (status === 1) {
            return "예약 완료";
        } else if (status === -1) {
            return "예약 취소";
        } else if (status === 0) {
            return "참여 완료";
        }
    }

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{reservation.popup?.store_name}</h2>
                <div className="onsite-qr-right">
                    <div className="onsite-qr-placeholder">
                        <QrCode reservationId={reservation.reservationId}/>
                    </div>
                </div>
                <p><strong>예약번호:</strong> {reservation.reservationId}</p>
                <p><strong>예약일시:</strong> {reservation.slot?.schedule.date} {reservation.slot?.start_time}</p>
                <p><strong>장소:</strong> {reservation.popup?.address} {reservation.popup?.address_detail}</p>
                <p><strong>결제금액:</strong>{(reservation.depositAmount).toLocaleString()}원</p>
                <p><strong>상태:</strong> {formatStatus(reservation.status)}</p>

                <button className="close-btn" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default MyReservationModal;
