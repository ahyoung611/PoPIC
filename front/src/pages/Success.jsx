import {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

export default function SuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
    const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;
    const peopleCount = Number(searchParams.get("people"));
    const popupId = searchParams.get("popupId");
    const {auth, getToken} = useAuth();
    const token = getToken();
    const user = auth?.user;

    useEffect(() => {
        if (!user) {
            return;
        }

        const requestData = {
            reservationId: null,
            userId: user.user_id,
            reservationCount: peopleCount,
            status: 0,
            depositAmount: Number(searchParams.get("amount")) * peopleCount,
            paymentKey: searchParams.get("paymentKey"),
            orderId: searchParams.get("orderId"),
            amount: Number(searchParams.get("amount")),
            user: { user_id: user.user_id },
            popup: { store_id: popupId },
            slot: {slot_id: searchParams.get("slotId")},
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

            let json = {};
            try {
                json = await response.json();
            } catch (err) {
                console.error("JSON 파싱 실패:", err);
            }

            if (!response.ok) {
                console.error("예약 확인 실패:", response.status, json);
                navigate(`/fail?message=${json?.message || "권한 오류"}&code=${response.status}`);
                return;
            }

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
                <p>{`결제 금액: ${Number(
                    searchParams.get("amount")
                ).toLocaleString()}원`}</p>
                <p>{`paymentKey: ${searchParams.get("paymentKey")}`}</p>
                <button type={"button"} onClick={() => navigate(`/userMyPage/${user.user_id}`)}>마이페이지</button>
            </div>
        </div>
    );
}