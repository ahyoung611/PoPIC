import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import MyReservation from "../../components/mypage/MyReservation.jsx";
import MyWalkIn from "../../components/mypage/MyWalkIn.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import "../../style/myPopic.css";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const RES_PAGE_SIZE = 4;
const WALK_PAGE_SIZE = 4;

const MyPopic = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [walkIn, setWalkIn] = useState([]);
  const { auth, getToken } = useAuth();
  const token = getToken();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialTab = query.get("tab") || "예약";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [resPage, setResPage] = useState(1);
  const [walkPage, setWalkPage] = useState(1);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "예약") {
      setResPage(1);
    } else {
      setWalkPage(1);
    }

    // (옵션) URL ?tab= 값 동기화
    const sp = new URLSearchParams(location.search);
    sp.set("tab", tab);
    navigate({ search: sp.toString() }, { replace: true });
  };

  // 예약 페이징
  const resTotal = reservations.length;
  const resTotalPages = Math.ceil(resTotal / RES_PAGE_SIZE) || 0;
  const resPageData = useMemo(() => {
    const start = (resPage - 1) * RES_PAGE_SIZE;
    return reservations.slice(start, start + RES_PAGE_SIZE);
  }, [reservations, resPage]);

  // 대기 페이징
  const walkTotal = walkIn.length;
  const walkTotalPages = Math.ceil(walkTotal / WALK_PAGE_SIZE) || 0;
  const walkPageData = useMemo(() => {
    const start = (walkPage - 1) * WALK_PAGE_SIZE;
    return walkIn.slice(start, start + WALK_PAGE_SIZE);
  }, [walkIn, walkPage]);

  const pageTitle = activeTab === "예약" ? "예약 현황" : "현장 대기 현황";

  useEffect(() => {
    const userId = auth?.user?.user_id;
    if (!userId) return;

    fetch(`${URL}/reservations/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setReservations(Array.isArray(data) ? data : data?.content ?? []))
      .catch((err) => console.error("예약 내역 조회 실패", err));

    fetch(`${URL}/waiting/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setWalkIn(Array.isArray(data) ? data : data?.content ?? []))
      .catch((err) => console.error("대기 내역 조회 실패", err));
  }, [auth?.user?.user_id, token]);

  const showResPagination = resTotal > RES_PAGE_SIZE && resTotalPages > 1;
  const showWalkPagination = walkTotal > WALK_PAGE_SIZE && walkTotalPages > 1;

  return (
    <div className="container">
      <div className="inner">
        <div className="myPopic">
          {/* 상단 타이틀 영역 */}
          <div className="page-head">
            <h1 className="page-title">{pageTitle}</h1>
          </div>

          {/* 탭 */}
          <div className="tab-menu">
            <button
              className={activeTab === "예약" ? "active" : ""}
              onClick={() => handleTabChange("예약")}
            >
              예약
            </button>
            <button
              className={activeTab === "대기" ? "active" : ""}
              onClick={() => handleTabChange("대기")}
            >
              현장발권
            </button>
          </div>

          {/* 예약 탭 */}
          {activeTab === "예약" && (
            <div className="panel" style={{ "--myPopic-list-rows": RES_PAGE_SIZE }}>
              <MyReservation
                reservations={resPageData}
                onUpdateReservation={setReservations}
              />
              <div className="pagination-keeper">
                {showResPagination && (
                  <Pagination
                    currentPage={resPage}
                    totalPages={resTotalPages}
                    onPageChange={setResPage}
                  />
                )}
              </div>
            </div>
          )}


          {/* 현장대가 탭 */}
          {activeTab === "대기" && (
            <div className="panel" style={{ "--myPopic-list-rows": WALK_PAGE_SIZE }}>
              <MyWalkIn walkIn={walkPageData} />
              <div className="pagination-keeper">
                {showWalkPagination && (
                  <Pagination
                    currentPage={walkPage}
                    totalPages={walkTotalPages}
                    onPageChange={setWalkPage}
                  />
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyPopic;
