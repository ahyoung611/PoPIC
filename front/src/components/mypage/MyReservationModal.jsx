import React, {useEffect, useState} from "react";
import "../../style/MyReservationModal.css";
import {useAuth} from "../../context/AuthContext.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReservationModal = ({open, onClose, reservation}) => {
const token = useAuth().getToken();
    const [status, setStatus] = useState(reservation?.status);
    useEffect(() => {
        if (reservation) {
            setStatus(reservation?.status);
        }
    }, [reservation]);

    if (!open || !reservation) return null;

    const formatStatus = (status) => {
        if (status === 1) {
            return "예약 완료";
        } else if (status === -1) {
            return "예약 취소";
        } else if (status === 0) {
            return "참여 완료";
        }
    }

    const reservationCancel = async () => {
        if (!window.confirm("정말 예약을 취소하시겠습니까?")) return;

        try {
            const response = await fetch(`${URL}/reservations/${reservation.reservationId}/cancel`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || "예약 취소에 실패했습니다.");
                return;
            }

            setStatus(-1);
            alert("예약이 취소되었습니다.");
        } catch (error) {
            console.error(error);
            alert("서버 오류로 예약 취소에 실패했습니다.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{reservation.popup?.store_name}</h2>
                {/*큐알 부분 나중에 css 수정하기*/}
                <div className="onsite-qr-right">
                    <div className="onsite-qr-placeholder">QR</div>
                </div>
                <p><strong>예약번호:</strong> {reservation.reservationId}</p>
                <p><strong>예약일시:</strong> {reservation.slot?.schedule.date} {reservation.slot?.start_time}</p>
                <p><strong>장소:</strong> {reservation.popup?.address} {reservation.popup?.address_detail}</p>
                <p><strong>결제금액:</strong>{(reservation.depositAmount).toLocaleString()}원</p>
                <p><strong>상태:</strong> {formatStatus(status)}</p>

                <button className="close-btn" onClick={onClose}>닫기</button>
                {status !== -1 && (
                    <button className="cancel-btn" onClick={reservationCancel}>
                        예약 취소
                    </button>
                )}
            </div>
        </div>
    );
};

export default MyReservationModal;
