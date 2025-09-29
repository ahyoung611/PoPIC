// AdminMain.jsx
import { useNavigate } from "react-router-dom";
import "../../style/adminMain.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect } from "react";

const AdminMain = () => {
  const nav = useNavigate();
  const { getToken, getUser } = useAuth();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") nav("/login", { replace: true });
  }, [token, user, nav]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="container admin-main-page"> {/* 페이지 스코프 */}
      <div className="inner">
        <div className="admin-main">
          <div
            className="tile popup-manage"
            role="button"
            tabIndex={0}
            onClick={() => nav("/admin/popupManage")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && nav("/admin/popupManage")}
          >
            <img className="tile__icon" src="/check-circle.png" alt="" aria-hidden="true" />
            <p className="tile__label">팝업 승인 | 반려</p>
            <span className="tile__chev" aria-hidden="true">›</span>
          </div>

          <div
            className="tile vendor-manage"
            role="button"
            tabIndex={0}
            onClick={() => nav("/admin/vendorManage")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && nav("/admin/vendorManage")}
          >
            <img className="tile__icon" src="/store-front.png" alt="" aria-hidden="true" />
            <p className="tile__label">팝업 운영자 관리</p>
            <span className="tile__chev" aria-hidden="true">›</span>
          </div>

          <div
            className="tile user-manage"
            role="button"
            tabIndex={0}
            onClick={() => nav("/admin/userManage")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && nav("/admin/userManage")}
          >
            <img className="tile__icon" src="/users.png" alt="" aria-hidden="true" />
            <p className="tile__label">회원 관리</p>
            <span className="tile__chev" aria-hidden="true">›</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminMain;
