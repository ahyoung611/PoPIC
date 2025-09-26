// src/pages/auth/KakaoCallback.jsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const KakaoCallback = () => {
    const [params] = useSearchParams();

    useEffect(() => {
        const code = params.get("code");
        const state = params.get("state");
        const savedState = localStorage.getItem("kakao_oauth_state");

        if (savedState && state !== savedState) {
            console.error("CSRF state mismatch!");
            return;
        }

        window.location.replace(
            `http://localhost:8080/auth/kakao/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state ?? "")}`
        );
    }, []);

    return <div>로그인 처리 중...</div>;
};

export default KakaoCallback;
