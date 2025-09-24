import React, {useEffect, useMemo, useRef, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, A11y} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import "../../style/mainPopupCard.css";
import MainPopupCardA from "./MainPopupCardA.jsx";

export default function MainPopupCardSlide({
                                               title = "",
                                               moreLink = "#",
                                               fetcher,
                                               limit = 5,
                                               slidesPerView = 4,
                                               categories = null,
                                               variant = "default",
                                               showMore = false,
                                           }) {
    const [activeCategory, setActiveCategory] = useState(categories?.[0]?.key ?? null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const sectionRef = useRef(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const [isPrevVisible, setPrevVisible] = useState(false);
    const [isNextVisible, setNextVisible] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetcher?.({categoryKey: activeCategory ?? undefined});
                if (mounted) setItems(Array.isArray(data) ? data.slice(0, limit) : []);
            } catch (e) {
                if (mounted) setItems([]);
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [fetcher, activeCategory, limit]);

    const bgImage = useMemo(() => {
        if (variant !== "bg" || items.length === 0) return null;
        return items[0].image;
    }, [items, variant]);

    const isBgFx = variant === "bg";

    return (
        <section
            ref={sectionRef}
            className={`mpc-section ${isBgFx ? "mpc-section--bgfx" : ""}`}
            style={isBgFx && bgImage ? {["--mpc-bg-image"]: `url(${bgImage})`} : undefined}
        >
            <h2 className="mpc-section__title">{title}</h2>

            {Array.isArray(categories) && categories.length > 0 && (
                <ul className="mpc-section__tabs">
                    {categories.map((c) => (
                        <li key={c.key}>
                            <button
                                className={`mpc-section__tab ${activeCategory === c.key ? "is-active" : ""}`}
                                onClick={() => setActiveCategory(c.key)}
                                type="button"
                            >
                                {c.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mpc-section__swiper-wrap">
                {loading ? (
                    <div className="mpc-section__loading">로딩중...</div>
                ) : (
                    <div className="mpc-section__viewport">
                        <Swiper
                            modules={[Navigation, A11y]}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            onSwiper={(swiper) => {
                                setTimeout(() => {
                                    if (prevRef.current && nextRef.current) {
                                        // 네비게이션 매개변수 ref 요소로 설정
                                        swiper.params.navigation.prevEl = prevRef.current;
                                        swiper.params.navigation.nextEl = nextRef.current;

                                        // 네비게이션 모듈을 초기화 -> 업데이트
                                        swiper.navigation.init();
                                        swiper.navigation.update();
                                    }

                                    // 슬라이드 변경 시 버튼 가시성 업데이트
                                    setPrevVisible(!swiper.isBeginning);
                                    setNextVisible(!swiper.isEnd);

                                    swiper.on("slideChange", () => {
                                        setPrevVisible(!swiper.isBeginning);
                                        setNextVisible(!swiper.isEnd);
                                    });
                                }, 0);
                            }}
                            slidesPerView={slidesPerView}
                            autoHeight={false}
                            onSlideChange={(s) => {
                                if (!isBgFx) return;
                                const idx = s.activeIndex ?? 0;
                                const img = items[idx]?.image;
                                if (img && sectionRef.current) {
                                    sectionRef.current.style.setProperty("--mpc-bg-image", `url(${img})`);
                                }
                            }}
                            breakpoints={{
                                1300: {slidesPerView, spaceBetween: 20, centeredSlides: false},
                                1100: {slidesPerView: 3, spaceBetween: 20, centeredSlides: false},
                                651: {slidesPerView: 2, spaceBetween: 16, centeredSlides: false},
                                0: {slidesPerView: 1, spaceBetween: 0, centeredSlides: true},
                            }}
                            className="mpc-section__swiper"
                        >
                            {items.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <MainPopupCardA
                                        image={item.image}
                                        alt={item.title}
                                        category={item.categoryLabel}
                                        bookmarked={Boolean(item.bookmarked)}
                                        onToggleBookmark={() => {
                                        }}
                                        periodText={item.periodText}
                                        title={item.title}
                                        onClick={() => {
                                        }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <button  ref={prevRef}
                                 className="mpc-swiper-button-prev"
                                 type="button"
                                 style={{ display: isPrevVisible ? "block" : "none" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button ref={nextRef}
                                className="mpc-swiper-button-next"
                                type="button"
                                style={{ display: isNextVisible ? "block" : "none" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {showMore && (
                <a className="mpc-section__more btn" href={moreLink}>
                    테마별 팝업 더보기 +
                </a>
            )}
        </section>
    );
}
