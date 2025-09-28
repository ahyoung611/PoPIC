import React from "react";
import "../../style/MyReservationModal.css";
import {useAuth} from "../../context/AuthContext.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReservationModal = ({ open, onClose, reservation }) => {
    const token = useAuth().getToken();

    const formatStatus = (status) => {
        if (status === 1) return "예약 완료";
        if (status === -1) return "예약 취소";
        if (status === 0) return "참여 완료";
    };

    if (!open) return null;

    const reservationCancel = async () => {
        if (!window.confirm("정말 예약을 취소하시겠습니까?")) return;

        try {
            const response = await fetch(`${URL}/reservations/cancel/${reservation.reservationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    paymentKey: reservation.paymentKey,
                    amount: reservation.depositAmount,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "예약 취소 실패");
                return;
            }

            alert("예약이 취소되고 환불이 진행되었습니다.");
            onClose();
        } catch (err) {
            console.error(err);
            alert("예약 취소 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{reservation.popup?.store_name}</h2>

                <div className="onsite-qr-right">
                    <div className="onsite-qr-placeholder">QR</div>
                </div>
                <p><strong>예약번호:</strong> {reservation.reservationId}</p>
                <p><strong>시간:</strong> {reservation.slot?.start_time}</p>
                <p><strong>장소:</strong> {reservation.popup?.address} {reservation.popup?.address_detail}</p>
                <p><strong>결제금액:</strong> {(reservation.depositAmount).toLocaleString()}원</p>
                <p><strong>상태:</strong> {formatStatus(reservation.status)}</p>

                <div className="btn-group">
                    <button className="close-btn" onClick={onClose}>닫기</button>
                    <button className="cancel-btn" onClick={reservationCancel}>예약 취소</button>
                </div>
            </div>
        </div>
    );
};

export default MyReservationModal;
