import React, { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import Button from "../commons/Button";
import "swiper/css";
import "swiper/css/navigation";

import "../../style/mainPopupCard.css";
import MainPopupCardA from "./MainPopupCardA.jsx";

export default function MainPopupCardSlide({
  title = "",
  moreLink = "",
  fetcher,
  limit = 8,
  slidesPerView = 4,
  categories = null,
  variant = "default",
  showMore = false,
  onCardClick,
  bookmarkedPopups,
  onToggleBookmark,
}) {

  const currentIndexRef = useRef(0)
  const [activeCategory, setActiveCategory] = useState(categories?.[0]?.key ?? null);
  const [loading, setLoading] = useState(true);

  const [rawItems, setRawItems] = useState([]);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const sectionRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [isPrevVisible, setPrevVisible] = useState(false);
  const [isNextVisible, setNextVisible] = useState(true);

  const isBgFx = variant === "bg";

  // 데이터 fetch
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetcher?.({ categoryKey: activeCategory ?? undefined });
        if (!mounted) return;
        const sliced = Array.isArray(data) ? data.slice(0, limit) : [];
        setRawItems(sliced);
      } catch (e) {
        if (mounted) setRawItems([]);
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [fetcher, activeCategory, limit]);

  // 북마크 적용
  const items = useMemo(() => {
    return rawItems.map((it) => ({
      ...it,
      bookmarked: bookmarkedPopups.has(Number(it.id)),
    }));
  }, [rawItems, bookmarkedPopups]);

  // 카테고리 초기화
  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategory(categories[0].key);
    }
  }, [categories]);

  // 카테고리 바뀔 때만 0으로 리셋
  useEffect(() => {
    if (!swiperInstance) return;
    swiperInstance.slideTo(0, 0);
    currentIndexRef.current = 0;
  }, [swiperInstance, activeCategory]);

  // 데이터/크기 변경 시엔 현재 인덱스 유지 업데이트만
  useEffect(() => {
    if (!swiperInstance) return;
    swiperInstance.update();
    swiperInstance.slideTo(currentIndexRef.current, 0);
    setPrevVisible(!swiperInstance.isBeginning);
    setNextVisible(!swiperInstance.isEnd);
  }, [swiperInstance, rawItems.length]);

  // 초기 배경 설정
  useEffect(() => {
    if (!isBgFx || items.length === 0 || !sectionRef.current) return;
    sectionRef.current.style.setProperty("--mpc-bg-image", `url(${items[0].image})`);
  }, [items, isBgFx]);

  // 슬라이드 변경 시 배경
  const handleSlideChange = (swiper) => {
      currentIndexRef.current = swiper.activeIndex ?? 0;
    if (!isBgFx || !sectionRef.current) return;
    const idx = swiper.activeIndex ?? 0;
    const img = items[idx]?.image;
    if (img) {
      sectionRef.current.style.setProperty("--mpc-bg-image", `url(${img})`);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`mpc-section ${isBgFx ? "mpc-section--bgfx" : ""}`}
    >
      <h2 className="mpc-section__title">{title}</h2>

      {Array.isArray(categories) && categories.length > 0 && (
        <ul className="mpc-section__tabs">
          {categories.map((c) => (
            <li key={c.key}>
              <Button
                variant="filter"
                selected={activeCategory === c.key}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </Button>
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
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
                setTimeout(() => {
                  if (prevRef.current && nextRef.current) {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                    swiper.navigation.init();
                    swiper.navigation.update();
                  }
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
              onSlideChange={handleSlideChange}
              breakpoints={{
                1300: { slidesPerView, spaceBetween: 20, centeredSlides: false },
                1100: { slidesPerView: 3, spaceBetween: 20, centeredSlides: false },
                651: { slidesPerView: 2, spaceBetween: 16, centeredSlides: false },
                0: { slidesPerView: 1, spaceBetween: 0, centeredSlides: true },
              }}
              className="mpc-section__swiper"
            >
              {items.map((item) => (
                <SwiperSlide key={item.id}>
                  <MainPopupCardA
                    popupId={item.id}
                    alt={item.title}
                    category={item.categoryLabel}
                    bookmarked={item.bookmarked}
                    onToggleBookmark={onToggleBookmark}
                    periodText={item.periodText}
                    title={item.title}
                    onClick={() => onCardClick(item.id)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={prevRef}
              className="mpc-swiper-button-prev"
              type="button"
              style={{ display: isPrevVisible ? "block" : "none" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              ref={nextRef}
              className="mpc-swiper-button-next"
              type="button"
              style={{ display: isNextVisible ? "block" : "none" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {showMore && (
        <a className="mpc-section__more btn" href={moreLink}>
          팝업 더보기 +
        </a>
      )}
    </section>
  );
}
