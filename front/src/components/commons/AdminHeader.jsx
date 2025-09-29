// src/components/admin/AdminHeader.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../style/header.css";

export default function AdminHeader({ showBack }) {
  const nav = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // 홈(루트)로 간주할 경로들
  const ROOT_PATHS = ["/admin"];

  // showBack이 boolean으로 넘어오면 그 값을 우선 사용, 아니면 자동 판별
  const autoBack = !ROOT_PATHS.includes(location.pathname);
  const shouldShowBack = typeof showBack === "boolean" ? showBack : autoBack;

  const handleLogout = () => {
    logout?.();
    nav("/main", { replace: true });
  };

  return (
    <>
      <header className="header">
        <div className="header__inner" style={{ justifyContent: "space-between" }}>
          <div className="header__left">
            {shouldShowBack && (
              <button
                type="button"
                className="header__back"
                aria-label="뒤로가기"
                onClick={() => nav(-1)}
              >
                &lt;
              </button>
            )}
          </div>

          <div
            className="header__brand"
            role="button"
            tabIndex={0}
            onClick={() => nav("/admin")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && nav("/admin")}
          >
            <img src="/popic-logo.png" alt="logo" />
          </div>

          <div className="header__right">
            <a
              className="header__link"
              href="#logout"
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
