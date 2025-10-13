import React, {useEffect, useState} from "react";
import "../../style/modal.css";
import QrCode from "../qr/QrCode.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import Button from "../commons/Button.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReservationModal = ({open, onClose, reservation, onUpdateReservation }) => {
  const token = useAuth().getToken();
  const [status, setStatus] = useState(reservation?.status);
  const [qrToken, setQrToken] = useState("");

  useEffect(() => {
    if (reservation) setStatus(reservation?.status);
  }, [reservation]);

  if (!open || !reservation) return null;

  const formatStatus = (s) => {
    if (s === 1) return "예약 완료";
    if (s === 0) return "참여 완료";
    if (s === -1) return "예약 취소";
    return "";
  };

  const reservationCancel = async () => {
    if (!window.confirm("정말 예약을 취소하시겠습니까?")) return;

    try {
        const response = await fetch(`${URL}/reservations/${reservation.reservationId}/cancel`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                qrToken: qrToken,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || "예약 취소에 실패했습니다.");
            return;
        }

        setStatus(-1);
        onUpdateReservation(reservation.reservationId, -1);
        alert("예약이 취소되었습니다.");

    } catch (error) {
        console.error(error);
        alert("서버 오류로 예약 취소에 실패했습니다.");
    }
  };

  return (
    <div className="modalMask reservationModal" onClick={onClose}>
      <div className="modalPanel" onClick={(e) => e.stopPropagation()}>
        <h2 className="modalTitle">{reservation.popup?.store_name}</h2>

        {/* QR 영역 */}
        <div className="qr-section qr-wrap">
          {open && (
            <QrCode
              setStatus={setStatus}
              setQrToken={setQrToken}
              reservation={reservation}
              onUpdateReservation={onUpdateReservation}
            />
          )}
        </div>

        {/* 정보 */}
        <div className="reservationList">
          <p><strong>예약번호</strong> {reservation.reservationId}</p>
          <p><strong>예약 날짜</strong> {reservation.slot?.schedule.date} {reservation.slot?.start_time}</p>
          <p><strong>장소</strong> {reservation.popup?.address} {reservation.popup?.address_detail}</p>
          <p><strong>결제금액</strong> {(reservation.depositAmount).toLocaleString()}원</p>
          <p><strong>상태</strong> {formatStatus(status)}</p>
        </div>

        {/* 버튼 */}
        <div className="modalActions">
            {status === 1 && (
                <Button variant="outline" color="gray" onClick={reservationCancel}>예약 취소</Button>
            )}
          <Button variant="primary" color="red" onClick={onClose}>닫기</Button>

        </div>
      </div>
    </div>
  );
};

export default MyReservationModal;
