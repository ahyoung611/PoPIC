import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const GoogleCallback = () => {
    const [params] = useSearchParams();

    useEffect(() => {
        const code = params.get("code");
        const state = params.get("state");
        const savedState = localStorage.getItem("naver_oauth_state");

        if (state !== savedState) {
            console.error("CSRF state mismatch!");
            return;
        }

        fetch(`http://localhost:8080/auth/naver/callback?code=${code}&state=${state}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("로그인 성공", data);
                // JWT 저장 or 쿠키 세팅됨
            });
    }, []);

    return <div>로그인 처리 중...</div>;
};

export default GoogleCallback;
