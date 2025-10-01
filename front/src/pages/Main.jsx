import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/commons/Banner.jsx";
import MainPopupCardSlide from "../components/commons/MainPopupCardSilde.jsx";
import apiRequest from "../utils/apiRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../style/mainPopupCard.css";

// API 서버 베이스 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// 상대 경로를 절대경로로 바꿔주는 유틸
const toAbs = (u) => (u?.startsWith("http") ? u : `${API_BASE_URL}${u?.startsWith("/") ? "" : "/"}${u || ""}`);

// 카테고리
const CATEGORY_JSON = [
  { category_id: "1", name: "패션" },
  { category_id: "2", name: "뷰티" },
  { category_id: "3", name: "식음료" },
  { category_id: "4", name: "라이프" },
  { category_id: "5", name: "테크" },
  { category_id: "6", name: "예술" },
  { category_id: "7", name: "취미" },
  { category_id: "8", name: "캐릭터" },
];

const CATEGORY_TABS = [
  { key: "all", label: "전체" },
  ...CATEGORY_JSON.map((c) => ({ key: String(c.category_id), label: c.name })),
];

// 배너 슬라이드 데이터
const slides = [
  { bg: "/banner/slide1.png", bgMd: "/banner/slide1-tablet.png", bgSm: "/banner/page1.png", thumb: "/banner/page1.png", alt: "배너 1" },
  { bg: "/banner/slide2.png", bgMd: "/banner/slide2-tablet.png", bgSm: "/banner/page2.png", thumb: "/banner/page2.png", alt: "배너 2" },
  { bg: "/banner/slide3.png", bgMd: "/banner/slide3-tablet.png", bgSm: "/banner/page3.png", thumb: "/banner/page3.png", alt: "배너 3" },
  { bg: "/banner/slide4.png", bgMd: "/banner/slide4-tablet.png", bgSm: "/banner/page4.png", thumb: "/banner/page4.png", alt: "배너 4" },
  { bg: "/banner/slide5.png", bgMd: "/banner/slide5-tablet.png", bgSm: "/banner/page5.png", thumb: "/banner/page5.png", alt: "배너 5" },
];

const Main = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth?.user?.user_id;
  const token = auth?.token;

  // 사용자의 북마크된 팝업 ID Set
  const [bookmarkedPopups, setBookmarkedPopups] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 날자 포맷팅
  const formatYmdDots = (s) => {
    if (!s) return "";
    const ymd = String(s).slice(0, 10);       // 'YYYY-MM-DD'
    return ymd.replaceAll("-", ".");          // 'YYYY.MM.DD'
  };

  // 내 북마크 목록 불러오기
  const fetchBookmarks = useCallback(async () => {
    if (!userId || !token) {
      setBookmarkedPopups(new Set());
      return;
    }
    try {
      const data = await apiRequest(`/userBookmark/popupList`, {}, token);
      const ids = Array.isArray(data) ? data.map((item) => Number(item.store_id)) : [];
      setBookmarkedPopups(new Set(ids));
    } catch (err) {
      console.error("북마크 가져오기 실패", err);
      setBookmarkedPopups(new Set());
    }
  }, [userId, token]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        await fetchBookmarks();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchBookmarks]);

  // 북마크 토글
  const handleToggleBookmark = useCallback(
    async (popupId, nextState) => {
      const idNum = Number(popupId);

      // 낙관적 UI
      setBookmarkedPopups((prev) => {
        const s = new Set(prev);
        if (nextState) s.add(idNum);
        else s.delete(idNum);
        return s;
      });

      if (!token || !userId) return; // 비로그인 시 API 호출 생략

      try {
        await apiRequest(
          `/userBookmark/toggle?userId=${userId}&storeId=${idNum}`,
          { method: "POST" },
          token
        );
      } catch (err) {
        console.error("북마크 저장 실패", err);
        // 롤백
        setBookmarkedPopups((prev) => {
          const s = new Set(prev);
          if (nextState) s.delete(idNum);
          else s.add(idNum);
          return s;
        });
      }
    },
    [userId, token]
  );

  // 이달의 팝업
  const fetchByMonthlyOpen = useCallback(async () => {
    const data = await apiRequest("/popupStore/monthly", {});
    return (Array.isArray(data) ? data : []).map((item) => ({
      id: Number(item.store_id),
      image: toAbs(item.thumb),
      title: item.store_name,
      periodText: `${formatYmdDots(item.start_date)} - ${formatYmdDots(item.end_date)}`,
      categoryLabel: item.category_names?.[0] || "", // 카드 배지는 섹션에서 숨김 가능
    }));
  }, []);

  // 곧 종료되는 팝업 (10일 이내)
  const fetchByClosingSoon = useCallback(async () => {
    const data = await apiRequest("/popupStore/monthly");
    const today = new Date();
    return (Array.isArray(data) ? data : [])
      .filter((item) => {
        const diffDays = Math.ceil((new Date(item.end_date) - today) / 86400000);
        return diffDays >= 0 && diffDays <= 10;
      })
      .map((item) => ({
        id: Number(item.store_id),
        image: toAbs(item.thumb),
        title: item.store_name,
       periodText: `${formatYmdDots(item.start_date)} - ${formatYmdDots(item.end_date)}`,
        categoryLabel: item.category_names?.[0] || "",
      }));
  }, []);

  // 카테고리별 팝업
  const fetchByCategory = useCallback(async ({ categoryKey }) => {
    const endpoint =
      categoryKey && categoryKey !== "all"
        ? `/popupStore/category?category=${categoryKey}`
        : "/popupStore/monthly";
    const data = await apiRequest(endpoint);
    return (Array.isArray(data) ? data : []).map((item) => ({
      id: Number(item.store_id),
      image: toAbs(item.thumb),
      title: item.store_name,
     periodText: `${formatYmdDots(item.start_date)} - ${formatYmdDots(item.end_date)}`,
      categoryLabel: item.category_names?.[0] || "",
    }));
  }, []);

  // 카드 클릭 시 상세 페이지로
  const handleCardClick = (popupId) => {
    navigate(`/popupStore/detail/${popupId}`);
  };

  return (
    <div className="container">
      <Banner slides={slides} height={600} autoDelay={3000} />

      {isLoading ? (
        <p className="loading-message">데이터를 불러오는 중입니다...</p>
      ) : (
        <>
          {/* 이달의 팝업 */}
          <div>
            <MainPopupCardSlide
              title="MONTHLY PICK"
              fetcher={fetchByMonthlyOpen}
              limit={8}
              slidesPerView={4}
              onCardClick={handleCardClick}
              bookmarkedPopups={bookmarkedPopups}
              onToggleBookmark={handleToggleBookmark}
              showTabs={false}
              showCategory={false}
            />
          </div>

          {/* 곧 종료되는 팝업 (10일 이내) */}
          <div  className="mpc-section--bgcolor">
            <MainPopupCardSlide
              title="CLOSING SOON"
              fetcher={fetchByClosingSoon}
              limit={8}
              slidesPerView={4}
              variant="bg"
              onCardClick={handleCardClick}
              bookmarkedPopups={bookmarkedPopups}
              onToggleBookmark={handleToggleBookmark}
              showTabs={false}
              showCategory={false}
            />
          </div>

          {/* 카테고리별 팝업 */}
          <div>
            <MainPopupCardSlide
              title="CATEGORY PICK"
              fetcher={fetchByCategory}
              categories={CATEGORY_TABS}
              limit={8}
              slidesPerView={4}
              showMore
              moreLink="/popupList"
              onCardClick={handleCardClick}
              bookmarkedPopups={bookmarkedPopups}
              onToggleBookmark={handleToggleBookmark}
              showTabs={true}
              showCategory={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
