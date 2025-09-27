import Banner from "../components/commons/Banner.jsx";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainPopupCardSlide from "../components/commons/MainPopupCardSilde.jsx";
import apiRequest from "../utils/apiRequest.js";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

const slides = [
  {
    bg: "/banner/slide1.png",
    bgMd: "/banner/slide1-tablet.png",
    bgSm: "/banner/page1.png",
    thumb: "/banner/page1.png",
    alt: "배너 1",
  },
  {
    bg: "/banner/slide2.png",
    bgMd: "/banner/slide2-tablet.png",
    bgSm: "/banner/page2.png",
    thumb: "/banner/page2.png",
    alt: "배너 2",
  },
  {
    bg: "/banner/slide3.png",
    bgMd: "/banner/slide3-tablet.png",
    bgSm: "/banner/page3.png",
    thumb: "/banner/page3.png",
    alt: "배너 3",
  },
  {
    bg: "/banner/slide4.png",
    bgMd: "/banner/slide4-tablet.png",
    bgSm: "/banner/page4.png",
    thumb: "/banner/page4.png",
    alt: "배너 4",
  },
  {
    bg: "/banner/slide5.png",
    bgMd: "/banner/slide5-tablet.png",
    bgSm: "/banner/page5.png",
    thumb: "/banner/page5.png",
    alt: "배너 5",
  },
];

const Main = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth?.user?.user_id;
  const token = auth?.token;

  const [bookmarkedPopups, setBookmarkedPopups] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const [monthlyPopups, setMonthlyPopups] = useState([]);
  const [closingPopups, setClosingPopups] = useState([]);
  const [categoryPopups, setCategoryPopups] = useState([]);

  // DB에서 북마크 가져오기
 const fetchBookmarks = useCallback(async () => {
   if (!userId || !token) return;

   try {
      const data = await apiRequest(`/userBookmark?userId=${userId}`, {}, token);
      const ids = Array.isArray(data) ? data.map(Number) : [];
      setBookmarkedPopups(new Set(ids));
      
     } catch (err) {
       console.error("북마크 가져오기 실패", err);
       setBookmarkedPopups(new Set());
     }
   }, [userId, token]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await fetchBookmarks(); // 북마크 먼저 가져오기
        const [monthlyData, closingData, categoryData] = await Promise.all([
          fetchByMonthlyOpen(),
          fetchByClosingSoon(),
          fetchByCategory({ categoryKey: CATEGORY_TABS[0].key }),
        ]);
        setMonthlyPopups(monthlyData);
        setClosingPopups(closingData);
        setCategoryPopups(categoryData);
      } catch (error) {
        console.error("초기 데이터 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchBookmarks]);

  // 북마크 토글
  const handleToggleBookmark = useCallback(
    async (popupId, isBookmarked) => {
      const idNum = Number(popupId);

      setBookmarkedPopups(prev => {
          const newSet = new Set(prev);
          if (isBookmarked) newSet.add(idNum);
          else newSet.delete(idNum);
          return newSet;
        });

      if (token) {
          console.log(token)
          console.log(userId)
        try {
          await apiRequest(
             `/userBookmark/toggle?userId=${userId}&storeId=${idNum}`,
              { method: "POST" },
              token);
        } catch (err) {
          console.error("북마크 저장 실패", err);
          setBookmarkedPopups(prev => {
            const newSet = new Set(prev);
            if (isBookmarked) newSet.delete(idNum);
            else newSet.add(idNum);
            return newSet;
          });
        }
      }

      // 화면 즉시 반영
      setMonthlyPopups(prev => prev.map(p => p.id === idNum ? { ...p, isBookmarked } : p));
      setClosingPopups(prev => prev.map(p => p.id === idNum ? { ...p, isBookmarked } : p));
      setCategoryPopups(prev => prev.map(p => p.id === idNum ? { ...p, isBookmarked } : p));
    },
    [token]
  );


  // 이달의 팝업
const fetchByMonthlyOpen = async () => {
  try {
    const data = await apiRequest("/popupStore/monthly", {});
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      id: Number(item.store_id),
      image: item.thumb,
      title: item.store_name,
      periodText: `${item.start_date} - ${item.end_date}`,
      isBookmarked: !!bookmarkedPopups && bookmarkedPopups.has(Number(item.store_id)),
    }));
  } catch (error) {
    console.error("월간 팝업 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
};

  // 곧 종료되는 팝업
 const fetchByClosingSoon = async () => {
   try {
     const data = await apiRequest("/popupStore/monthly");
     if (!Array.isArray(data)) return [];

     const today = new Date();
     return data
       .filter((item) => {
         const endDate = new Date(item.end_date);
         const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
         return diffDays >= 0 && diffDays <= 10;
       })
       .map((item) => ({
         id: Number(item.store_id),
         image: `${API_BASE_URL}${item.thumb}`,
         title: item.store_name,
         periodText: `${item.start_date} - ${item.end_date}`,
       }));
   } catch (error) {
     console.error("CLOSING SOON 데이터를 가져오는 중 오류 발생:", error);
     return [];
   }
 };

  // 카테고리별 팝업
const fetchByCategory = async ({ categoryKey }) => {
  try {
    const endpoint =
      categoryKey && categoryKey !== "all"
        ? `/popupStore/category?category=${categoryKey}`
        : "/popupStore/monthly";

    const data = await apiRequest(endpoint);
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      id: Number(item.store_id),
      image: item.thumb,
      title: item.store_name,
      periodText: `${item.start_date} - ${item.end_date}`,
      categoryLabel:
        item.category_names && item.category_names.length > 0
          ? item.category_names[0]
          : "",
    }));
  } catch (error) {
    console.error("카테고리별 팝업 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
};

  const handleCardClick = (popupId) => {
    navigate(`/popupStore/detail/${popupId}`);
  };

  return (
    <>
      <div>
        <Banner slides={slides} height={600} autoDelay={3000} />
      </div>

      {isLoading ? (
        <p className="loading-message">데이터를 불러오는 중입니다...</p>
      ) : (
        <>
          <div>
            <MainPopupCardSlide
              title="MONTHLY PICK"
              fetcher={fetchByMonthlyOpen}
              limit={8}
              slidesPerView={4}
              onCardClick={handleCardClick}
              bookmarkedPopups={bookmarkedPopups}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>

          <div className="mpc-section--bgcolor">
            <MainPopupCardSlide
              title="CLOSING SOON"
              fetcher={fetchByClosingSoon}
              limit={8}
              slidesPerView={4}
              variant="bg"
              onCardClick={handleCardClick}
              bookmarkedPopups={bookmarkedPopups}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>

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
            />
          </div>
        </>
      )}
    </>
  );
};

export default Main;
