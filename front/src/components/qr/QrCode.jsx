import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import apiRequest from "../../utils/apiRequest.js";

const QrCode = ({ setStatus, reservation, setQrToken, onUpdateReservation }) => {
    const [qrData, setQrData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState(null);
    const token = useAuth().getToken();

    // QR 생성
    useEffect(() => {
        const fetchQr = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/generate-qr?reservationId=${reservation.reservationId}`,
                    {
                        headers: { authorization: `Bearer ${token}` },
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );
                if (!res.ok) throw new Error(`QR 요청 실패: ${res.status}`);

                const data = await res.json();
                setQrData(data);
                setQrToken(data.token);
                setTimeLeft(5 * 60); // 타이머 5분 초기화
                setError(null);
                console.log(data);
            } catch (err) {
                console.error("QR 코드 생성 오류:", err);
                setError("QR 코드 생성에 실패했습니다.");
                setQrData(null);
            }
        };

        fetchQr();
    }, [reservation, token]);

    // SSE 연결
    useEffect(() => {
        if (!qrData?.token) return;

        const evtSource = new EventSource(
            `http://localhost:8080/qr-stream?token=${qrData.token}`
        );

        evtSource.onmessage = (event) => {
            console.log("QR 상태 업데이트:", event.data);


            if (event.data === "USED" || event.data === "CANCELED") {
                setQrData((prev) => ({ ...prev, status: event.data }));
                if(event.data === "USED"){
                    setStatus(0);
                    onUpdateReservation(reservation.reservationId, 0);
                }else{
                    setStatus(-1);
                    onUpdateReservation(reservation.reservationId, -1);
                }
                setTimeLeft(0); // 타이머 0으로 초기화
                evtSource.close();
            } else if (event.data === "OK") {
                setQrData((prev) => ({ ...prev, status: "OK" }));
            }
        };

        evtSource.onerror = () => evtSource.close();

        return () => evtSource.close(); // 언마운트 시 종료
    }, [qrData?.token]);

    // 타이머 감소
    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    if (error) return <p className="qr-error">{error}</p>;
    if (!qrData) return <p className="qr-loading">로딩 중...</p>;

    return (
        <div className="qr-container">
            <img
                className={`qr-image ${qrData.status === "USED" || qrData.status === "CANCELED" ? "qr-used" : ""}`}
                src={qrData.qrImage}
                alt="예약 QR 코드"
            />
            {qrData.status === "USED" && <div className="qr-overlay">사용 완료</div>}
            {qrData.status === "CANCELED" && <div className="qr-overlay">예약 취소됨</div>}
            {qrData.status === "OK" && (
                timeLeft > 0 ? (
                    <p className="qr-timer">
                        유효시간: <span className="point-color">{formatTime(timeLeft)}</span>
                    </p>
                ) : (
                    <p className="qr-expired">QR 코드가 만료되었습니다.</p>
                )
            )}
        </div>
    );
};

export default QrCode;
