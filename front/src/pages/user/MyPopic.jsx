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
    const [activeTab, setActiveTab] = useState("예약");

    useEffect(() => {
        const userId = auth?.user?.user_id;
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
        <div className="userMyPage">
            <div className="tab-menu">
                <button
                    className={activeTab === "예약" ? "active" : ""}
                    onClick={() => setActiveTab("예약")}
                >
                    예약
                </button>
                <button
                    className={activeTab === "대기" ? "active" : ""}
                    onClick={() => setActiveTab("대기")}
                >
                    현장발권
                </button>
            </div>

            {activeTab === "예약" && (
                <MyReservation reservations={reservations}/>
            )}
            {activeTab === "대기" && (
                <MyWalkIn walkIn={walkIn}/>
            )}
        </div>
    );
};
export default MyPopic;
