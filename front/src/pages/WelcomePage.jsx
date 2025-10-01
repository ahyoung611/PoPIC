import React, { useEffect } from "react";
import "../style/welcomePage.css";
import {useNavigate} from "react-router-dom";

const WelcomePage = () => {
    const nav = useNavigate();

    const toMain = ()=>{
        nav("/main");
    }

    useEffect(() => {
        if (window.particlesJS) {
            window.particlesJS("particles-js", {
                particles: {
                    number: { value: 355, density: { enable: true, value_area: 789.15 } },
                    color: { value: "#ffffff" },
                    shape: {
                        type: "circle",
                        stroke: { width: 0, color: "#000000" },
                        polygon: { nb_sides: 5 },
                    },
                    opacity: {
                        value: 0.49,
                        random: false,
                        anim: { enable: true, speed: 0.25, opacity_min: 0, sync: false },
                    },
                    size: {
                        value: 2,
                        random: true,
                        anim: { enable: true, speed: 0.333, size_min: 0, sync: false },
                    },
                    line_linked: { enable: false },
                    move: {
                        enable: true,
                        speed: 0.1,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false,
                        attract: { enable: false, rotateX: 600, rotateY: 1200 },
                    },
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "bubble" },
                        onclick: { enable: true, mode: "push" },
                        resize: true,
                    },
                    modes: {
                        bubble: { distance: 100, size: 2.2, duration: 3, opacity: 1, speed: 3 },
                        repulse: { distance: 200, duration: 0.4 },
                        push: { particles_nb: 4 },
                        remove: { particles_nb: 2 },
                    },
                },
                retina_detect: true,
            });
        }
    }, []);

    return (
        <div className="earth-container">
            <div id="particles-js">
                <div className="popic">
                    <img onClick={toMain} src="/popic3D.png" alt="popic" />
                </div>
                <div class="earth-wrap">
                    <div className="earth">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
