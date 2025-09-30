import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../style/qrCode.css";

const QrCode = ({reservationId}) => {
    const [qrData, setQrData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState(null);
    const token = useAuth().getToken();

    useEffect(() => {
        const fetchQr = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/generate-qr?reservationId=${reservationId}`,
                    {
                        headers: { authorization: `Bearer ${token}` },
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );
                if (!res.ok) throw new Error(`QR 요청 실패: ${res.status}`);

                const data = await res.json();
                console.log("QR 생성:", data);

                setQrData(data);
                setTimeLeft(5 * 60); // 타이머 5분 초기화
                setError(null);
            } catch (err) {
                console.error("QR 코드 생성 오류:", err);
                setError("QR 코드 생성에 실패했습니다.");
                setQrData(null);
            }
        };

        fetchQr();
    }, [token]);

    // SSE 연결
    useEffect(() => {
        if (!qrData?.token) return;

        const evtSource = new EventSource(
            `http://localhost:8080/qr-stream?token=${qrData.token}`
        );

        evtSource.onmessage = (event) => {
            console.log("QR 상태 업데이트:", event.data);

            if (event.data === "USED") {
                setQrData((prev) => ({
                    ...prev,
                    status: "USED",
                }));
                evtSource.close();
            }
        };

        evtSource.onerror = () => evtSource.close();

        return () => evtSource.close(); // 언마운트 시 종료
    }, [qrData?.token]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);



    useEffect(() => {
        if (!qrData) return;
        if(qrData.status === "USED") setTimeLeft(0);
    }, [qrData]);

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
                className={`qr-image ${qrData.status === "USED" ? "qr-used" : ""}`}
                src={qrData.qrImage}
                alt="예약 QR 코드"
            />

            {qrData.status === "USED" && (
                <div className="qr-overlay">사용 완료</div>
            )}

            {qrData.status === "OK" && (
                timeLeft > 0 ? (
                    <p className="qr-timer">유효시간: {formatTime(timeLeft)}</p>
                ) : (
                    <p className="qr-expired">QR 코드가 만료되었습니다.</p>
                )
            )}
        </div>
    );
};

export default QrCode;
