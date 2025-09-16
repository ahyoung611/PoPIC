import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../style/header.css";

export default function VendorHeader({ onLogout }) {
    const nav = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("body--lock", open);
        return () => document.body.classList.remove("body--lock");
    }, [open]);

    const close = () => setOpen(false);
    const linkClass = ({ isActive }) => `header__link ${isActive ? "is-active" : ""}`;

    return (
        <>
            <header className="header">
                <div className="header__inner">
                    <button className="header__hamburger" aria-label="메뉴 열기" onClick={() => setOpen(true)}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>

                    <div className="header__brand" onClick={() => nav("/vendor")}>
                        <img src="/popic-logo.png" alt="logo" />
                    </div>

                    <nav className="header__nav">
                        <NavLink to="/vendor" end className={linkClass}>홈</NavLink>
                        <NavLink to="/vendor/popups/edit" className={linkClass}>팝업 등록</NavLink>
                        <NavLink to="/vendor/reservations" className={linkClass}>예약 관리</NavLink>
                        <NavLink to="/vendor/onsite" className={linkClass}>현장 관리</NavLink>
                    </nav>

                    <div className="header__right">
                        <a className="header__link" onClick={onLogout}>로그아웃</a>
                        <NavLink to="/vendor/mypage" className={linkClass}>마이페이지</NavLink>
                    </div>
                </div>
            </header>

            {/* 모바일 */}
            <div className={`Drawer__mask ${open ? "is-open" : ""}`} onClick={close} />
            <aside className={`Drawer__panel ${open ? "is-open" : ""}`} role="dialog" aria-label="메뉴">
                <button aria-label="닫기" onClick={close}
                        style={{ background: "transparent", border: 0, fontSize: 22, marginBottom: 8, cursor: "pointer", color:"black" }}>✕</button>
                <div className="Drawer__section">
                    <NavLink to="/vendor" end className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>홈</NavLink>
                    <NavLink to="/vendor/popups/edit" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>팝업 등록</NavLink>
                    <NavLink to="/vendor/reservations" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>예약 관리</NavLink>
                    <NavLink to="/vendor/onsite" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>현장 관리</NavLink>
                    <a className="Drawer__item" onClick={() => { close(); onLogout?.(); }}>로그아웃</a>
                    <NavLink to="/vendor/mypage" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>마이페이지</NavLink>
                </div>
            </aside>
        </>
    );
}
