import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"; // commons → context 경로 주의(../../)

export default function RequireAdmin({ children }) {
    const { getUser } = useAuth();
    const user = getUser();
    const location = useLocation();

    // ADMIN 아니면 로그인으로
    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
}
