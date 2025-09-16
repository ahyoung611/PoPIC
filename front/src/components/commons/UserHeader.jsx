import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../style/header.css";

export default function UserHeader({ isLoggedIn = false }) {
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
                    {/* 햄버거(모바일) */}
                    <button className="header__hamburger" aria-label="메뉴 열기" onClick={() => setOpen(true)}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>

                    {/* 로고 */}
                    <div className="header__brand" onClick={() => nav("/")}>
                        <img src="/popic-logo.png" alt="logo" />
                    </div>

                    {/* 데스크톱 내비 */}
                    <nav className="header__nav">
                        <NavLink to="/" end className={linkClass}>홈</NavLink>
                        <NavLink to="/popups" className={linkClass}>팝업 예약</NavLink>
                        <NavLink to="/board" className={linkClass}>게시판</NavLink>
                    </nav>

                    {/* 우측 */}
                    <div className="header__right">
                        {isLoggedIn
                            ? <NavLink to="/mypage" className={linkClass}>마이페이지</NavLink>
                            : <NavLink to="/login" className={linkClass}>로그인</NavLink>}
                    </div>
                </div>
            </header>
            <div className="header__accent" />

            {/* 모바일 드로어 */}
            <div className={`Drawer__mask ${open ? "is-open" : ""}`} onClick={close} />
            <aside className={`Drawer__panel ${open ? "is-open" : ""}`} role="dialog" aria-label="메뉴">
                <button aria-label="닫기" onClick={close}
                        style={{ background: "transparent", border: 0,fontSize: 22, marginBottom: 8, cursor: "pointer"}}>✕</button>

                <div className="Drawer__section">
                    <NavLink to="/" end className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>홈</NavLink>
                    <NavLink to="/popups" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>팝업 예약</NavLink>
                    <NavLink to="/board" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>게시판</NavLink>
                    {isLoggedIn
                        ? <NavLink to="/mypage" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>마이페이지</NavLink>
                        : <NavLink to="/login" className={({isActive})=>`Drawer__item ${isActive?"is-active":""}`} onClick={close}>로그인/회원가입</NavLink>}
                </div>
            </aside>
        </>
    );
}
