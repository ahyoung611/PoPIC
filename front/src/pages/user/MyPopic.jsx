import {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import MyReservation from "../../components/mypage/MyReservation.jsx";
import MyWalkIn from "../../components/mypage/MyWalkIn.jsx";
import Pagination from "../../components/commons/Pagination.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const RES_PAGE_SIZE = 5;
const WALK_PAGE_SIZE = 5;

const MyPopic = () => {
    const [reservations, setReservations] = useState([]);
    const [walkIn, setWalkIn] = useState([]);
    const {auth, getToken} = useAuth();
    const token = getToken();
    const [activeTab, setActiveTab] = useState("예약");

    const [resPage, setResPage] = useState(1);
    const [walkPage, setWalkPage] = useState(1);

    // const formatDateTime = (dateString) => {
    //     if (!dateString) return "";
    //     const d = new Date(dateString);
    //     const yyyy = d.getFullYear();
    //     const mm = String(d.getMonth() + 1).padStart(2, "0");
    //     const dd = String(d.getDate()).padStart(2, "0");
    //     const hh = String(d.getHours()).padStart(2, "0");
    //     const min = String(d.getMinutes()).padStart(2, "0");
    //     return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    // };
    //
    // const formatStatus = (status) => {
    //     if (status === 1) {
    //         return "예약 완료";
    //     } else if (status === -1) {
    //         return "예약 취소";
    //     } else if (status === 0) {
    //         return "참여 완료";
    //     }
    // }

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
            .then(data => setReservations(Array.isArray(data) ? data : (data?.content ?? [])))
            .catch(err => console.error("예약 내역 조회 실패", err));

        fetch(`${URL}/waiting/user/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => res.json())
            .then(data => setWalkIn(Array.isArray(data) ? data : (data?.content ?? [])))
            .catch(err => console.error("대기 내역 조회 실패", err));
    }, [auth?.user?.user_id, token]);


    useEffect(() => setResPage(1), [reservations]);
    useEffect(() => setWalkPage(1), [walkIn]);

    // 예약 페이징
    const resTotal = reservations.length;
    const resTotalPages = Math.max(1, Math.ceil(resTotal / RES_PAGE_SIZE));
    const resPageData = useMemo(() => {
        const start = (resPage - 1) * RES_PAGE_SIZE;
        return reservations.slice(start, start + RES_PAGE_SIZE);
    }, [reservations, resPage]);

    // 대기 페이징
    const walkTotal = walkIn.length;
    const walkTotalPages = Math.max(1, Math.ceil(walkTotal / WALK_PAGE_SIZE));
    const walkPageData = useMemo(() => {
        const start = (walkPage - 1) * WALK_PAGE_SIZE;
        return walkIn.slice(start, start + WALK_PAGE_SIZE);
    }, [walkIn, walkPage]);

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
                <>
                    <MyReservation reservations={resPageData}/>
                    <Pagination
                        currentPage={resPage}
                        totalPages={resTotalPages}
                        onPageChange={setResPage}
                    />
                </>
            )}

            {activeTab === "대기" && (
                <>
                    <MyWalkIn walkIn={walkPageData}/>
                    <Pagination
                        currentPage={walkPage}
                        totalPages={walkTotalPages}
                        onPageChange={setWalkPage}
                    />
                </>
            )}
        </div>
    );
};
export default MyPopic;
