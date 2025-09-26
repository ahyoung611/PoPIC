import Banner from "../components/commons/Banner.jsx";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import MainPopupCardSlide from "../components/commons/MainPopupCardSilde.jsx";
import apiRequest from "../utils/apiRequest.js";
import {useAuth} from "../context/AuthContext.jsx";

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
    ...CATEGORY_JSON.map(c => ({ key: String(c.category_id), label: c.name }))
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

    // 이달의 팝업
    const fetchByMonthlyOpen = async () => {
        try {
            const data = await apiRequest('/popupStore/monthly',{});
            console.log("API 응답:", data);

            if (!Array.isArray(data)) return [];
            return data.map(item => ({
                id: item.store_id,
                image: item.thumb,
                title: item.store_name,
                periodText: `${item.start_date} - ${item.end_date}`
            }));

        } catch (error) {
            console.error('월간 팝업 데이터를 가져오는 중 오류 발생:', error);
            return [];
        }
    };
    useEffect(() => {
        fetchByMonthlyOpen();
    }, []);

    // 곧 종료되는 팝업
    const fetchByClosingSoon = async () => {
        try {
            const data = await apiRequest('/popupStore/monthly'); // 월간 팝업 데이터 가져오기
            if (!Array.isArray(data)) return [];

            const today = new Date();
            const closingSoonList = data
                .filter(item => {
                    const endDate = new Date(item.end_date);
                    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 10; // 오늘~10일 이내 종료
                })
                .map(item => ({
                    id: item.store_id,
                    image: `${API_BASE_URL}${item.thumb}`,
                    title: item.store_name,
                    periodText: `${item.start_date} - ${item.end_date}`
                }));

            return closingSoonList;
        } catch (error) {
            console.error('CLOSING SOON 데이터를 가져오는 중 오류 발생:', error);
            return [];
        }
    };

    // 카테고리 별 팝업
    const fetchByCategory = async ({ categoryKey }) => {
        try {
            const endpoint = categoryKey && categoryKey !== "all"
                 ? `/popupStore/category?category=${categoryKey}`
                : '/popupStore/monthly';
            console.log("categoryKey: " + categoryKey);
            console.log("endpoint: " + endpoint);

            const data = await apiRequest(endpoint);
            if (!Array.isArray(data)) return [];

            return data.map(item => ({
                id: item.store_id,
                image: item.thumb,
                title: item.store_name,
                periodText: `${item.start_date} - ${item.end_date}`,
                categoryLabel: item.category_names && item.category_names.length > 0 ? item.category_names[0] : ''
            }));
        } catch (error) {
            console.error('카테고리별 팝업 데이터를 가져오는 중 오류 발생:', error);
            return [];
        }
    };

    const [on, setOn] = useState(false);
     const handleCardClick = (popupId) => {
          navigate(`/popupStore/detail/${popupId}`);
        };

    return (
        <>
            <div>
                <Banner slides={slides} height={600} autoDelay={3000} />
            </div>

            <div >
                <MainPopupCardSlide
                    title="MONTHLY PICK"
                    fetcher={fetchByMonthlyOpen}
                    limit={8}
                    slidesPerView={4}
                    onCardClick={handleCardClick}
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
                />
            </div>

            <div >
                <MainPopupCardSlide
                    title="CATEGORY PICK"
                    fetcher={fetchByCategory}
                    categories={CATEGORY_TABS}
                    limit={8}
                    slidesPerView={4}
                    showMore
                    moreLink="/popupList"
                    onCardClick={handleCardClick}
                />
            </div>
        </>
    );
}

export default Main