import { useAuth } from "../context/AuthContext";
import Banner from "./Banner.jsx";
import React from "react";

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
    const {auth} = useAuth();

    return (
        <>
            <div>
                <Banner slides={slides} height={600} autoDelay={3000} />
            </div>
        </>
    );
}

export default Main