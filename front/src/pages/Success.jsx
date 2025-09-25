import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

export default function SuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
    const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;
    const peopleCount = Number(searchParams.get("people"));
    const popupId = searchParams.get("popupId");
    const slotId = searchParams.get("slotId");
    const {auth, getToken} = useAuth();
    const token = getToken();
    const user = auth?.user;
    const [depositAmount, setDepositAmount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const rawAmount = Number(searchParams.get("amount") || 0);
        const people = peopleCount || 0;

        const deposit = 10000;
        const totalAmount = rawAmount === 0
            ? deposit  // 예약금 결제
            : rawAmount;

        setDepositAmount(totalAmount);

        const requestData = {
            reservationCount: people,
            status: 0,
            depositAmount: totalAmount,
            paymentKey: searchParams.get("paymentKey") || null,
            user: { user_id: user?.user_id || null },
            popup: { store_id: popupId },
            slot: { slot_id: slotId },
        };

        async function confirm() {
            const response = await fetch(`${URL}/reservations/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                // JSON 본문 파싱
                const json = await response.json().catch(() => null);
                console.error("예약 확인 실패:", response.status, json);
                navigate(`/fail?message=${json?.message || "권한 오류"}&code=${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("예약 확인 성공:", data);

            fetch(`${URL}/popupStore/slots?popupId=${popupId}&date=${requestData.date}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            })
                .then(res => res.json())
                .then(updatedSlots => {
                    console.log("최신 슬롯:", updatedSlots);
                });
        }

        confirm();
    }, [token, user]);

    return (
        <div className="result wrapper">
            <div className="box_section">
                <h2>
                    결제 성공
                </h2>
                <p>{`주문번호: ${searchParams.get("orderId")}`}</p>
                <p>{`결제 금액: ${depositAmount.toLocaleString()}원`}</p>
                <p>{`paymentKey: ${searchParams.get("paymentKey")}`}</p>
                <button type={"button"} onClick={() => navigate(`/userMyPage/${user.user_id}`)}>마이페이지</button>
            </div>
        </div>
    );
}