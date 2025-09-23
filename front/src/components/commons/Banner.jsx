import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import useMediaQuery from "../../hooks/useMediaQuery.js";
import "../../style/Banner.css";

export default function Banner({
                                   slides = [],
                                   autoDelay = 3000,
                                   className = "",
                                   height = 600,
                               }) {
    const swiperRef = useRef(null);
    const [active, setActive] = useState(0);

    const isMobile = useMediaQuery(`(max-width: 768px)`);
    const isTablet = useMediaQuery(`(min-width: 769px) and (max-width: 1024px)`);

    const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
    const total = safeSlides.length;
    if (!total) return null;

    const pickSrc = useCallback((s) => {
        if (isMobile) return s.bgSm || s.bg || s.thumb;
        if (isTablet) return s.bgMd || s.bg || s.thumb;
        return s.bg || s.bgMd || s.bgSm || s.thumb;
    }, [isMobile, isTablet]);

    const goTo = useCallback((idx) => {
        const s = swiperRef.current;
        if (s) s.slideToLoop(idx, 500);
    }, []);
    const onSwiper = (ins) => { swiperRef.current = ins; };
    const onSlideChange = (ins) => setActive(ins.realIndex ?? ins.activeIndex ?? 0);
    const onSlideChangeTransitionStart = (ins) => {
        ins.params.speed = ins?.autoplay?.running ? 1500 : 0;
    };

    // 키보드 접근성 로직
    useEffect(() => {
        if (isMobile) return;
        const handler = (e) => {
            const s = swiperRef.current;
            if (!s) return;
            if (e.key === "ArrowRight") s.slideNext(0);
            if (e.key === "ArrowLeft") s.slidePrev(0);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isMobile]);

    return (
        <section className={`banner-react ${className}`}>
            <div className="banner-wrap" style={{ height: `${height}px` }}>
                <Swiper
                    modules={[Navigation, Autoplay, EffectFade]}
                    effect="fade" // 부드러운 전환 효과
                    centeredSlides
                    speed={1500}
                    loop
                    autoplay={{ delay: autoDelay, disableOnInteraction: false }}
                    navigation={{ nextEl: ".banner-next", prevEl: ".banner-prev" }}
                    onSwiper={onSwiper}
                    onSlideChange={onSlideChange}
                    onSlideChangeTransitionStart={onSlideChangeTransitionStart}
                    className="BSwiper"
                >
                    {safeSlides.map((s, idx) => (
                        <SwiperSlide key={idx}>
                            <div
                                className="slide-bg"
                                style={{ backgroundImage: `url(${pickSrc(s)})` }}
                                role="img"
                                aria-label={s.alt || `배너 ${idx + 1}`}
                            />
                        </SwiperSlide>
                    ))}
                    <button className="swiper-button-prev banner-prev" aria-label="이전 배너" />
                    <button className="swiper-button-next banner-next" aria-label="다음 배너" />
                </Swiper>

                {/* 하단 썸네일 바 */}
                { !isMobile && (
                    <div className="scrollbar" aria-label="배너 썸네일 목록">
                        <ul className="page-wrap">
                            {safeSlides.map((s, idx) => {
                                const on = idx === active ? "on" : "";
                                return (
                                    <li key={`thumb-${idx}`}>
                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                        <a
                                            href="#"
                                            className={on}
                                            aria-current={on ? "true" : "false"}
                                            onClick={(e) => { e.preventDefault(); goTo(idx); }}
                                            onMouseEnter={() => goTo(idx)}
                                        >
                                            <img src={s.thumb || s.bg} alt={s.alt || `배너 ${idx + 1} 썸네일`} />
                                            <span>{idx + 1}/{total}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}