import {useEffect, useState} from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyPopic = () => {
    const [reservations, setReservations] = useState([]);
    const {auth, getToken} = useAuth();
    const token = getToken();

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    };

    useEffect(() => {
        const userId = auth?.user?.user_id; // 로그인 후 상태에 userId 저장되어 있어야 함
        if (!userId) return;

        fetch(`${URL}/reservations/user/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => res.json())
            .then(data => setReservations(data))
            .catch(err => console.error("예약 내역 조회 실패", err));
    }, [token]);

    return (
        <div>
            <h2>내 예약 내역</h2>
            {reservations.map(r => (
                <div key={r.reservationId}>
                    <p>예약일: {formatDateTime(r.createdAt)}</p>
                    <p>팝업명: {r.popup?.store_name}</p>
                    <p>팝업시간: {r.slot?.start_time}</p>
                    <p>결제금액: {r.depositAmount}</p>
                </div>
            ))}
        </div>
    );
}
export default MyPopic;