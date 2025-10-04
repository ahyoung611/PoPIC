import {useEffect, useState} from "react";
import {replace, useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import Button from "../components/commons/Button.jsx";
import "../style/success.css"
import FloatingBg from "../components/commons/FloatingBg";

const bgImgs = [
  "/favicon.png",
  "/bgIcon/Picon.png",
  "/bgIcon/Oicon.png",
  "/bgIcon/Picon.png",
  "/bgIcon/Iicon.png",
  "/bgIcon/Cicon.png",
];

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

export default function SuccessPage() {
    const {auth, getToken} = useAuth();
    const token = getToken();
    const user = auth?.user;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const peopleCount = Number(searchParams.get("people"));
    const popupId = searchParams.get("popupId");
    const slotId = searchParams.get("slotId");
    const price = Number(searchParams.get("amount"));
    const date = searchParams.get("date");

    const [popupName, setPopupName] = useState("");
    const [slotTime, setSlotTime] = useState("");
    const [slotDate, setSlotDate] = useState("");

    useEffect(() => {
        if (!user) return;

        sessionStorage.setItem("reservationConfirmed", "true");

        const requestData = {
            reservationCount: peopleCount,
            status: 0,
            depositAmount: price * peopleCount,
            paymentKey: searchParams.get("paymentKey") || null,
            user: {user_id: user?.user_id || null},
            popup: {store_id: popupId},
            slot: {slot_id: slotId},
        };

        async function confirm() {
            const response = await fetch(`${URL}/reservations/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const json = await response.json().catch(() => null);
                console.error("예약 확인 실패:", response.status, json);
                navigate(`/fail?message=${json?.message || "권한 오류"}&code=${response.status}`);
                return;
            }

            // 팝업 이름 가져오기
            fetch(`${URL}/popupStore/popupDetail?id=${popupId}`, {
                headers: {Authorization: `Bearer ${token}`},
            })
                .then((res) => res.json())
                .then((popup) => {
                    setPopupName(popup.store_name);
                });

            // 슬롯 시간 가져오기
            if (date) {
                fetch(`${URL}/popupStore/slots?popupId=${popupId}&date=${date}`, {
                    headers: {Authorization: `Bearer ${token}`},
                })
                    .then((res) => res.json())
                    .then((slots) => {
                        const slot = slots.find((s) => String(s.slot_id) === String(slotId));
                        if (slot) {
                            setSlotDate(slot.schedule.date);
                            setSlotTime(slot.start_time);
                        }
                    });
            }
        }

        confirm();
    }, [popupId, slotId, date, token]);

    return (
        <div className="container">
            <FloatingBg images={bgImgs} count={8} opacity={0.5} />
            <div className="success-wrapper">
                <div className="success-card">
                    <div className="success-illustration">
                        <img src="/AfterOnsite.png" alt="성공 이미지"/>
                        <p className="success-message">결제가 완료되었습니다!</p>
                    </div>

                    <h3 className="popup-title">{popupName}</h3>

                    <div className="reservation-box">
                        <p><strong>예약 번호</strong>{searchParams.get("orderId")}</p>
                        <p><strong>예약 시간</strong>{slotDate} {slotTime}</p>
                        <p><strong>예약 인원</strong>{peopleCount}명</p>
                        <p><strong>결제 금액</strong><span className="price">{price.toLocaleString()}원</span></p>
                    </div>

                    <div className="btn-area">
                        <Button
                            variant="primary"
                            color="red"
                            onClick={() => navigate(`/userMyPage/${user.user_id}`)}
                        >
                            마이페이지
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}