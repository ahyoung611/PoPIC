import {createContext, useContext, useEffect, useState} from "react";

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

    const getToken = () => context.auth.token;

    const setToken = (token) => {
        setAuth(prev => ({ ...prev, token }));
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, getToken, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
