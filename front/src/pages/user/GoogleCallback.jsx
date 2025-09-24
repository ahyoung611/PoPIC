import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../../utils/apiRequest.js";

const GoogleCallback = () => {
    const [params] = useSearchParams();

    useEffect(() => {
        const code = params.get("code");
        const state = params.get("state");
        const savedState = localStorage.getItem("google_oauth_state");

        if (state !== savedState) {
            console.error("CSRF state mismatch!");
            return;
        }

        window.location.replace(
            `http://localhost:8080/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state ?? "")}`
        );

    }, []);

    return <div>로그인 처리 중...</div>;
};

export default GoogleCallback;
