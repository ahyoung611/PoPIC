import {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import MyReservation from "../../components/mypage/MyReservation.jsx";
import MyWalkIn from "../../components/mypage/MyWalkIn.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyPopic = () => {
    const [reservations, setReservations] = useState([]);
    const [walkIn, setWalkIn] = useState([]);
    const {auth, getToken} = useAuth();
    const token = getToken();
    const [activeTab, setActiveTab] = useState("예약"); // 기본 탭
    const [tabs, setTabs] = useState(["예약", "대기"]);

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

    const formatStatus = (status) => {
        if (activeTab === "예약") {
            if (status === 1) {
                return "예약 완료";
            } else if (status === -1) {
                return "예약 취소";
            } else if (status === 0) {
                return "참여 완료";
            }
        } else {
            if (status === 1) {
                return "대기 완료";
            } else if (status === -1) {
                return "대기 취소";
            } else if (status === 0) {
                return "참여 완료";
            }
        }
    }

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

        fetch(`${URL}/waiting/user/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => res.json())
            .then(data => setWalkIn(data))
            .catch(err => console.error("대기 내역 조회 실패", err));
    }, [token]);

    return (
        <div>
            <h2>내 예약 내역</h2>
            <div>
                <button onClick={() => setActiveTab("예약")}>예약</button>
                <button onClick={() => setActiveTab("대기")}>대기</button>
            </div>

            {activeTab === "예약" && (
                <MyReservation
                    reservations={reservations}
                    formatStatus={formatStatus}
                />
            )}
            {activeTab === "대기" && (
                <MyWalkIn
                    walkIn={walkIn}
                    formatDateTime={formatDateTime}
                    formatStatus={formatStatus}
                />
            )}
        </div>
    );
}
export default MyPopic;