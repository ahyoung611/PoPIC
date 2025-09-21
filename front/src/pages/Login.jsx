// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";

import eye from "../../public/eye.png";
import nonEye from "../../public/nonEye.png";
import logo from "../../public/popic-logo.png";

import kakao from "../../public/kakao.png";
import naver from "../../public/naver.png";
import google from "../../public/google.png";
import passwordIcon from "../../public/icon-password-inactive.png";
import passwordIconActive from "../../public/icon-password-active.png";
import usernameIcon from "../../public/icon-username-inactive.png";
import usernameIconActive from "../../public/icon-username-active.png";
import privateCheckG from "../../public/privateCheck-g.png";
import privateCheckP from "../../public/privateCheck-p.png";

import "../style/login.css";
import "../style/button.css";


const Login = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const initialRole = params.get("role") === "VENDOR" ? "VENDOR" : "USER";

    const [role, setRole] = useState(initialRole);
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keep, setKeep] = useState(false);
    const [form, setForm] = useState({
        login_id: "",
        password: "",
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.login_id || !form.password) return;

        try {
            setLoading(true);
            const endpoint = role === "USER" ? "/user/login" : "/vendor/login";
            const data = await apiRequest(endpoint, { method: "POST", body: form });

            if (!data?.result) {
                alert(data?.message || "로그인에 실패했습니다.");
                return;
            }

            const storage = keep ? localStorage : sessionStorage;
            if (data.token) storage.setItem("token", data.token);
            if (data.user) storage.setItem("me", JSON.stringify(data.user));

            navigate("/");
        } catch (err) {
            console.error(err);
            alert("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 네이버 로그인
    const naverLogin = () => {
        console.log("naver login");
        const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
        const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI;

        console.log("NAVER_CLIENT_ID: ", NAVER_CLIENT_ID);
        console.log("NAVER_REDIRECT_URI: ", NAVER_REDIRECT_URI);

        const handleNaverLogin = () => {
            const state = crypto.randomUUID(); // CSRF 방지용 state
            localStorage.setItem("naver_oauth_state", state);

            const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${state}`;
            window.location.href = naverAuthUrl;
        };
        handleNaverLogin();
    }

    const goJoinHref = `/join?role=${role}`;

    return (
        <main className="login">
            <section className="login-card">
                <header className="login-header">
                    <img className="login-logo" src={logo} alt="PoPiC" />
                </header>

                {/* 역할 탭 */}
                <div className="login-role">
                    <button
                        type="button"
                        className={`btn btn--outline ${role === "USER" ? "" : "is-gray"}`}
                        onClick={() => setRole("USER")}
                        aria-pressed={role === "USER"}
                    >
                        일반회원
                    </button>
                    <button
                        type="button"
                        className={`btn btn--outline ${role === "VENDOR" ? "" : "is-gray"}`}
                        onClick={() => setRole("VENDOR")}
                        aria-pressed={role === "VENDOR"}
                    >
                        팝업 운영자
                    </button>
                </div>

                {/* 로그인 폼 */}
                <form className="login-form" onSubmit={onSubmit}>
                    {/* 아이디 */}
                    <div className="login-field login-field--with-icon">
                        <img
                            className="login-icon-left"
                            src={form.login_id ? usernameIconActive : usernameIcon}
                            alt=""
                            aria-hidden="true"
                        />
                        <input
                            className="login-input"
                            name="login_id"
                            placeholder="아이디"
                            value={form.login_id}
                            onChange={onChange}
                            required
                            autoComplete="username"
                        />
                    </div>

                    {/* 비밀번호 + 보기 토글 */}
                    <div className="login-field login-field--with-icon login-field--password">
                        <img
                            className="login-icon-left"
                            src={form.password ? passwordIconActive : passwordIcon}
                            alt=""
                            aria-hidden="true"
                        />
                        <input
                            className="login-input"
                            type={showPw ? "text" : "password"}
                            name="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={onChange}
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="login-icon-btn"
                            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
                            onClick={() => setShowPw((v) => !v)}
                        >
                            <img src={showPw ? eye : nonEye} alt="" />
                        </button>
                    </div>

                    {/* 로그인 상태 유지 - 이미지 토글 */}
                    <button
                        type="button"
                        className="login-keep-toggle"
                        onClick={() => setKeep((k) => !k)}
                        aria-pressed={keep}
                    >
                        <img
                            src={keep ? privateCheckP : privateCheckG}
                            alt={keep ? "로그인 상태 유지: 켜짐" : "로그인 상태 유지: 꺼짐"}
                        />
                        <span>로그인 상태 유지</span>
                    </button>

                    {/* 로그인 버튼 */}
                    <button
                        className="btn btn--primary is-red login-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "처리 중" : "로그인"}
                    </button>

                    {/* 소셜 로그인 */}
                    <div className="login-socials" aria-label="소셜 로그인">
                        <button type="button" className="login-social-btn" title="카카오 로그인">
                            <img src={kakao} alt="kakao" />
                        </button>
                        <button type="button" className="login-social-btn" title="네이버 로그인"
                        onClick={naverLogin}>
                            <img src={naver} alt="naver" />
                        </button>
                        <button type="button" className="login-social-btn" title="구글 로그인">
                            <img src={google} alt="google" />
                        </button>
                    </div>
                </form>

                {/* 푸터 - 회원가입 링크 */}
                <footer className="login-footer">
                    <div className="login-signup">
                        <Link to={goJoinHref}>회원가입</Link>
                    </div>
                </footer>
            </section>
        </main>
    );
};

export default Login;
