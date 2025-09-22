import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
    const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;
    const peopleCount = Number(searchParams.get("people"));

    useEffect(() => {
        const requestData = {
            reservationId: null,                // 새 예약이므로 null
            userId: 1,                          // 로그인 연동 후 수정
            reservationCount: peopleCount,
            status: 0,
            depositAmount: Number(searchParams.get("amount"))*peopleCount,
            paymentKey: searchParams.get("paymentKey"),
        };

        async function confirm() {
            const response = await fetch(`${URL}/reservations/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const json = await response.json();

            if (!response.ok) {
                // 결제 실패 비즈니스 로직을 구현하세요.
                navigate(`/fail?message=${json.message}&code=${json.code}`);
                return;
            }

            if (response.ok) {
                // 예약(결제) 데이터 서버에 저장 요청
                await fetch(`${URL}/reservations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderId: requestData.orderId,
                        amount: requestData.amount,
                        paymentKey: requestData.paymentKey,
                        // userId: currentUser.id, // 로그인 구현 후 주석 해제하기
                    }),
                });

                navigate("/userMyPage");
            }
        }
        confirm();
    }, []);

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
            </div>
        </div>
    );
}