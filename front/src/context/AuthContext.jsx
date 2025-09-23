import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
    });

    // 새로고침 후에도 유지
    useEffect(() => {
        const saved = localStorage.getItem("auth");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAuth(parsed);
            } catch (_) {}
        }
    }, []);

    // 변경 시 저장
    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    // 소셜 콜백 (?social=google&token=...)
    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        const social = qs.get("social");
        const token = qs.get("token");
        if (social && token) {
            setAuth(prev => ({ ...prev, token }));
            // 콜백 파라미터 정리
            const url = new URL(window.location.href);
            url.searchParams.delete("social");
            url.searchParams.delete("token");
            window.history.replaceState({}, "", url.toString());
        }
    }, []);

    const login = (token, user) => {
        setAuth({ token, user });
    };

    const logout = () => {
        setAuth({ token: null, user: null });
    };

    const getToken = () => context.auth.token;

    const setToken = (token) => {
        setAuth(prev => ({ ...prev, token }));
    };

    const setUser  = (user)  => setAuth(prev => ({ ...prev, user }));

    // 401 때 쓸 리프레시 헬퍼 (쿠키 필요하므로 credentials 포함)
    const refreshAccessToken = async (API_BASE_URL) => {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",               // ★ refreshToken 쿠키를 보내려면 필요
        });
        if (!res.ok) throw new Error("refresh_failed");
        const data = await res.json();
        if (!data?.result || !data?.token) throw new Error("refresh_failed");
        setToken(data.token);
        return data.token;
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, getToken, setToken, setUser, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
