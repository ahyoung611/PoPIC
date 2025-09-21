import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const requestData = {
            orderId: searchParams.get("orderId"),
            amount: searchParams.get("amount"),
            paymentKey: searchParams.get("paymentKey"),
            // userId: searchParams.get("userId"),
            userId: 1, // 아직 없어서 1로 설정함 나중엔 위의 코드 풀면 됨

        };

        async function confirm() {
            const response = await fetch("/confirm", {
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
                await fetch("/reservations", {
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