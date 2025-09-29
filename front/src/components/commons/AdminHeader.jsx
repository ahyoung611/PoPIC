import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../style/header.css";

export default function AdminHeader({ showBack = false, onLogout }) {
    const nav = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        if (onLogout) {          // 기존 prop 우선
            onLogout();
            return;
        }
        logout?.();              // 수정: 컨텍스트 로그아웃
        nav("/main", { replace: true }); // 수정: 로그아웃 후 이동 경로
    };

    return (
        <>
            <header className="header">
                <div className="header__inner" style={{ justifyContent: "space-between" }}>
                    <div style={{ width: 40 }}>
                        {showBack && (
                            <button
                                aria-label="뒤로"
                                onClick={() => nav(-1)}
                                style={{ background: "transparent", border: 0, fontSize: 20, cursor: "pointer" }}
                            >
                                &rsaquo;
                            </button>
                        )}
                    </div>
                    <div className="header__brand" onClick={() => nav("/admin")}>
                        <img src="/popic-logo.png" alt="logo" />
                    </div>
                    <div className="header__right">
                        {/*<a className="header__link" onClick={onLogout}>로그아웃</a>*/}
                        <a
                            className="header__link"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                        >
                            로그아웃
                        </a>
                    </div>
                </div>
            </header>
            <div className="header__accent--thin" />
        </>
    );
}
