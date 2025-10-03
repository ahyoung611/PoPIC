import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../style/header.css";

export default function VendorHeader() {
    const nav = useNavigate();
    const { auth, logout } = useAuth();

    const vendorId =
        auth?.vendor?.vendor_id ??
        auth?.user?.vendor_id ??
        auth?.vendor_id ??
        null;

    const [open, setOpen] = useState(false);
    useEffect(() => {
        document.body.classList.toggle("body--lock", open);
        return () => document.body.classList.remove("body--lock");
    }, [open]);

    const close = () => setOpen(false);
    const linkClass = ({ isActive }) => `header__link ${isActive ? "is-active" : ""}`;

    const onLogout = () => {
        logout?.();
        nav("/main", { replace: true }); // 로그아웃 후 홈으로
    };

    const loginPath        = "/login";
    const homePath         = vendorId ? `/vendor/${vendorId}/popups`       : loginPath;
    const reservationsPath = vendorId ? `/vendor/${vendorId}/reservations` : loginPath;
    const onsitePath       = vendorId ? `/vendor/${vendorId}/onsite`       : loginPath;
    const myPagePath       = vendorId ? `/vendor/myPage/${vendorId}`       : loginPath;

    const brandLanding = vendorId ? `/vendor/${vendorId}` : "/vendor";

    return (
        <>
            <header className="header">
                <div className="header__inner">
                    {/* 햄버거(모바일) */}
                    <button className="header__hamburger" aria-label="메뉴 열기" onClick={() => setOpen(true)}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M3 12h18M3 18h18" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* 로고 */}
                    <div className="header__brand" onClick={() => nav("/vendor/${vendorId}/popups")}>
                        <img src="/popic-logo.png" alt="logo" />
                    </div>

                    {/* 데스크톱 내비 */}
                    <nav className="header__nav">
                        <NavLink to={homePath} end className={linkClass}>팝업 관리</NavLink>
                        <NavLink to={reservationsPath} className={linkClass}>예약 관리</NavLink>
                        <NavLink to={onsitePath} className={linkClass}>현장 관리</NavLink>
                    </nav>

                    <div className="header__right">
                        {vendorId ? (
                            <>
                                <NavLink to={myPagePath} className={linkClass}>마이페이지</NavLink>
                                <a className="header__logout" onClick={onLogout}>로그아웃</a>
                            </>
                        ) : (
                            <NavLink to={loginPath} className={linkClass}>로그인</NavLink>
                        )}
                    </div>
                </div>
            </header>

            {/* 모바일 드로어 */}
            <div className={`Drawer__mask ${open ? "is-open" : ""}`} onClick={close} />
            <aside className={`Drawer__panel ${open ? "is-open" : ""}`} role="dialog" aria-label="메뉴">
                <button
                    aria-label="닫기"
                    onClick={close}
                    style={{ background: "transparent", border: 0, fontSize: 22, marginBottom: 8, cursor: "pointer", color:"black" }}
                >
                    ✕
                </button>

                <div className="Drawer__section">
                    <NavLink to={homePath} end className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>팝업 관리</NavLink>
                    <NavLink to={reservationsPath} className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>예약 관리</NavLink>
                    <NavLink to={onsitePath} className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>현장 관리</NavLink>

                    {vendorId ? (
                        <>
                            <NavLink to={myPagePath} className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>마이페이지</NavLink>
                            <a className="Drawer__item" onClick={() => { onLogout(); close(); }}>로그아웃</a>
                        </>
                    ) : (
                        <NavLink to={loginPath} className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>로그인</NavLink>
                    )}
                </div>
            </aside>
        </>
    );
}
