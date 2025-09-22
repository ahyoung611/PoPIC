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

    const logout = () => {
        setAuth({ token: null, user: null });
    };

    const getToken = () => auth.token;

    const setToken = (token) => {
        setAuth(prev => ({ ...prev, token }));
    };

    // ✅ 새로고침 시 자동 로그인
    useEffect(() => {
        const refreshLogin = async () => {
            try {
                const data = await apiRequest("/auth/refresh", {
                    method: "POST",
                }, getToken());
                if (data?.result) {
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
