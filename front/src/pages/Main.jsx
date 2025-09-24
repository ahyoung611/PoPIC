import Banner from "../components/commons/Banner.jsx";
import React, { useState } from "react";
import MainPopupCardSlide from "../components/commons/MainPopupCardSilde.jsx";

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
const sample = {
    image: "/sample.webp",
    title: "곰 보금자리 프로젝트 : GOME SWEET HOME",
    periodText: "25.09.09 - 25.09.29",
    category: "캐릭터",
};

const fetchByMonthlyOpen = async () => {
    try {
        const response = await fetch('/api/popups/monthly');

        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();

        // 백엔드에서 받은 데이터를 프론트엔드에서 사용하는 형식으로 변환
        // 예시: { id, image, title, periodText } 형식으로 변환
        return data.map(item => ({
            id: item.store_id,
            image: item.image_url, // 백엔드에서 image_url 필드를 제공한다고 가정
            title: item.store_name,
            periodText: `${item.start_date} - ${item.end_date}`
        }));

    } catch (error) {
        console.error('월간 팝업 데이터를 가져오는 중 오류 발생:', error);
        return []; // 에러 발생 시 빈 배열 반환
    }
};

const fetchBgRanking = async () => {
    return [
        { id:1, image:"/sample.webp", title:"곰 보금자리 프로젝트 : GOME SWEET HOME", periodText:"25.09.09 - 25.09.29" },
        { id:2, image:"/sample.webp", title:"곰 보금자리 프로젝트 : GOME SWEET HOME", periodText:"25.09.09 - 25.09.29" },
        { id:3, image:"/sample.webp", title:"곰 보금자리 프로젝트 : GOME SWEET HOME", periodText:"25.09.09 - 25.09.29" },
        { id:4, image:"/sample.webp", title:"곰 보금자리 프로젝트 : GOME SWEET HOME", periodText:"25.09.09 - 25.09.29" },
        { id:5, image:"/sample.webp", title:"곰 보금자리 프로젝트 : GOME SWEET HOME", periodText:"25.09.09 - 25.09.29" },
    ];
};

const fetchByCategory = async ({ categoryKey }) => {
    if (!categoryKey || categoryKey === "all") {
        return [
            { id:21, image:"/sample.webp", title:"곰 보금자리 프로젝트", periodText:"25.09.09 - 25.09.29", categoryLabel:"캐릭터" },
            { id:22, image:"/sample.webp", title:"OO 패션 팝업", periodText:"25.10.01 - 25.10.30", categoryLabel:"패션" },
            { id:23, image:"/sample.webp", title:"디저트 팝업", periodText:"25.10.05 - 25.10.12", categoryLabel:"식음료" },
            { id:24, image:"/sample.webp", title:"라이프 굿즈", periodText:"25.10.08 - 25.10.20", categoryLabel:"라이프" },
            { id:25, image:"/sample.webp", title:"테크 체험존", periodText:"25.10.10 - 25.10.25", categoryLabel:"테크" },
        ];
    }

    // 실제로는 categoryKey(=카테고리 id)로 API 호출하거나 DB 조건 주면 됨
    const mockById = {
        "1": [ // 패션
            { id:31, image:"/sample.webp", title:"F/W 한정 팝업", periodText:"25.10.01 - 25.10.15", categoryLabel:"패션" },
            { id:32, image:"/sample.webp", title:"스트릿 브랜드 X", periodText:"25.10.10 - 25.10.20", categoryLabel:"패션" },
        ],
        "8": [ // 캐릭터
            { id:41, image:"/sample.webp", title:"곰돌이 굿즈샵", periodText:"25.10.01 - 25.10.10", categoryLabel:"캐릭터" },
        ],
    };
    return mockById[categoryKey] ?? [];
};

const Main = () => {

    const [on, setOn] = useState(false);

    return (
        <>
            <div>
                <Banner slides={slides} height={600} autoDelay={3000} />
            </div>

            <div >
                <MainPopupCardSlide
                    title="MONTHLY PICK"
                    fetcher={fetchByMonthlyOpen}
                    limit={5}
                    slidesPerView={4}
                />
            </div>

            <div className="mpc-section--bgcolor">
                <MainPopupCardSlide
                    title="CLOSING SOON"
                    fetcher={fetchBgRanking}
                    limit={5}
                    slidesPerView={4}
                    variant="bg"
                />
            </div>

            <div >
                <MainPopupCardSlide
                    title="CATEGORY PICK"
                    fetcher={fetchByCategory}
                    categories={CATEGORY_TABS}
                    limit={5}
                    slidesPerView={4}
                    showMore
                    moreLink="/popupstores/themes"
                />
            </div>
        </>
    );
}

export default Main