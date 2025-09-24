import {createContext, useContext, useEffect, useState} from "react";
import apiRequest from "../utils/apiRequest.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
    });


    const login = (token, user) => {
        setAuth({ token, user });
    };

    const logout = async () => {
        try{
            await apiRequest("/auth/logout", {method: "POST"}, getToken())
        }finally {
            setAuth({ token: null, user: null });
        }
    };

    const getToken = () => auth.token;
    const setToken = (token) => {
        setAuth(prev => ({ ...prev, token }));
    };

        // 401 때 쓸 리프레시 헬퍼 (쿠키 필요하므로 credentials 포함)
    // const refreshAccessToken = async (API_BASE_URL) => {
    //     const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    //         method: "POST",
    //         credentials: "include",               // ★ refreshToken 쿠키를 보내려면 필요
    //     });
    //     if (!res.ok) throw new Error("refresh_failed");
    //     const data = await res.json();
    //     if (!data?.result || !data?.token) throw new Error("refresh_failed");
    //     setToken(data.token);
    //     return data.token;
    // };

    useEffect(() => {
        const refreshLogin = async () => {
            try {
                const data = await apiRequest("/auth/refresh", {
                    method: "POST",
                });
                if (data) {
                    setAuth({ token: data.accessToken, user: data.user, loading: false });
                } else {
                    setAuth({ token: null, user: null, loading: false });
                }
            } catch {
                setAuth({ token: null, user: null, loading: false });
            }
        };
        refreshLogin();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, login, logout, getToken, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
