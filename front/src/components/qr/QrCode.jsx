import { useEffect, useState } from "react";
import {useAuth} from "../../context/AuthContext.jsx"

const QrCode = () => {
    const [qrUrl, setQrUrl] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0); // 초 단위
    const [error, setError] = useState(null);
    const auth = useAuth();
    const token = auth.token;

    // QR 생성
    useEffect(() => {
        const generateQr = async () => {
            try {
                const res = await fetch("http://localhost:8080/generate-qr", {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!res.ok) throw new Error(`QR 요청 실패: ${res.status}`);

                const blob = await res.blob();
                setQrUrl(URL.createObjectURL(blob));
                setTimeLeft(5 * 60); // 5분 = 300초
                setError(null);
            } catch (err) {
                console.error("QR 코드 생성 오류:", err);
                setError("QR 코드 생성에 실패했습니다.");
                setQrUrl(null);
            }
        };

        generateQr();
    }, []);

    // 카운트다운
    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    // 시간 포맷 mm:ss
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {qrUrl && (
                <div>
                    <img
                        src={qrUrl}
                        alt="예약 QR 코드"
                        style={{ marginTop: "10px", border: "1px solid #ccc" }}
                    />
                    {timeLeft > 0 ? (
                        <p>유효시간: {formatTime(timeLeft)}</p>
                    ) : (
                        <p style={{ color: "red" }}>QR 코드가 만료되었습니다.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QrCode;
