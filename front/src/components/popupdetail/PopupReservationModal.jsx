import "../../style/modal.css";
import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;


const PopupReservationModal = ({isOpen, onClose, reservationData}) => {
    if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 반환하지 않음
    const navigate = useNavigate();
    const {auth, getToken} = useAuth();
    const user = auth?.user;
    const token = getToken();
    const [status, setStatus] = React.useState(reservationData.status);

    const goCheckout = async () => {
        try {
            const host =
                (typeof window !== "undefined" && window.location?.hostname) || "localhost";
            const URL =
                (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

            const res = await fetch(
                `${URL}/reservations/check-duplicate?userId=${user?.user_id}&storeId=${reservationData.popupId}&slotId=${reservationData.slot_id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${auth?.token}`, // 필요하면 토큰 포함
                    },
                }
            );

            const json = await res.json();
            if (json.exists) {
                alert("이미 예약이 되어있습니다.");
                return;
            }

            if (reservationData.price > 0) {
                // 중복 예약이 없을 때만 checkout 페이지로 이동
                navigate(
                    `/checkout?price=${reservationData.price}&name=${encodeURIComponent(
                        reservationData.name
                    )}&date=${reservationData.date}&time=${reservationData.time}&people=${reservationData.reservationCount}&popupId=${reservationData.popupId}&slotId=${reservationData.slot_id}`
                );
            } else {
                // 무료 팝업인 경우 결제 진행 x
                try {
                    const res = await fetch(`${URL}/reservations/free`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            slotId: reservationData.slot_id,
                            storeId: reservationData.popupId,
                            reservationCount: reservationData.reservationCount,
                        }),
                    });
                    const json = await res.json();
                    if (!res.ok) {
                        alert(json?.message || "예약 실패했습니다.");
                        return;
                    }
                    setStatus(1);
                    alert("예약이 완료되었습니다.");
                    navigate(`/userMyPage/${user.user_id}`)
                    onClose?.();
                } catch (e) {
                    console.error(e);
                    alert("예약 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                }
            }
        } catch (err) {
            console.error("중복 체크 실패:", err);
            alert("예약 상태 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    return (
        <div className="modalMask reservationModal" onClick={onClose}>
            <div className="modalPanel" onClick={(e) => e.stopPropagation()}>
                <h2 className="modalTitle">예약 정보</h2>

                <div className="reservationList">
                    <p><strong>팝업 이름 </strong> {reservationData.name}</p>
                    <p><strong>예약 날짜 </strong> {reservationData.date}</p>
                    <p><strong>예약 시간 </strong> {reservationData.time}</p>
                    <p><strong>인원 </strong> {reservationData.reservationCount}명</p>
                    <p><strong>금액 </strong> <span className="price">{(reservationData.price*reservationData.reservationCount).toLocaleString()}원</span></p>
                </div>

                <div className="modalActions">
                    <button className="modalBtn btnPay" onClick={goCheckout}>결제</button>
                    <button className="modalBtn btnGhost" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default PopupReservationModal;
