import { useState } from "react";
import "../style/join.css";
import apiRequest from "../utils/apiRequest.js" // ← 헬퍼 경로 맞게 수정

const Join = () => {
    const [role, setRole] = useState("USER");
    const [showPw, setShowPw] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        // USER
        login_id: "",
        email: "",
        password: "",
        name: "",
        phone_number: "",
        // VENDOR
        vendor_name: "",
        manager_name: "",
        brn: "",
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = role === "USER" ? "/user/join" : "/vendor/join";

            const body =
                role === "USER"
                    ? {
                        login_id: form.login_id,
                        email: form.email,
                        password: form.password,
                        name: form.name,
                        phone_number: form.phone_number,
                    }
                    : {
                        login_id: form.login_id,
                        password: form.password,
                        vendor_name: form.vendor_name,
                        manager_name: form.manager_name,
                        phone_number: form.phone_number,
                        brn: form.brn,
                    };

            const data = await apiRequest(endpoint, { method:'POST', body })
            if (!data.result) { alert(data.message); return; }
            alert('회원가입 성공');

            // 폼 리셋
            setForm({
                login_id: "",
                email: "",
                password: "",
                name: "",
                phone_number: "",
                vendor_name: "",
                manager_name: "",
                brn: "",
            });
        } catch (err) {
            setMsg(err?.message || "에러");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="join">
            <section className="join-card">
                <header className="join-header">
                    <img className="join-logo" src="#" alt="PoPiC" />
                </header>

                <form className="join-form" onSubmit={onSubmit}>
                    {/* 아이디 */}
                    <div className="join-field">
                        <input
                            className="join-input"
                            name="login_id"
                            placeholder="아이디"
                            value={form.login_id}
                            onChange={onChange}
                            required
                            minLength={3}
                        />
                    </div>

                    {/* 비밀번호 + 보기 토글 */}
                    <div className="join-field join-field--password">
                        <input
                            className="join-input"
                            type={showPw ? "text" : "password"}
                            name="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={onChange}
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            className="join-icon-btn"
                            aria-label="비밀번호 표시"
                            onClick={() => setShowPw((v) => !v)}
                            title="비밀번호 표시"
                        >
                            👁
                        </button>
                    </div>

                    {/* 전화번호 */}
                    <div className="join-field">
                        <input
                            className="join-input"
                            name="phone_number"
                            placeholder="전화번호"
                            value={form.phone_number}
                            onChange={onChange}
                        />
                    </div>

                    {/* USER 전용 */}
                    {role === "USER" && (
                        <>
                            <div className="join-field">
                                <input
                                    className="join-input"
                                    type="email"
                                    name="email"
                                    placeholder="이메일"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="join-field">
                                <input
                                    className="join-input"
                                    name="name"
                                    placeholder="이름"
                                    value={form.name}
                                    onChange={onChange}
                                />
                            </div>
                        </>
                    )}

                    {/* VENDOR */}
                    {role === "VENDOR" && (
                        <>
                            <div className="join-field">
                                <input
                                    className="join-input"
                                    name="vendor_name"
                                    placeholder="상호명"
                                    value={form.vendor_name}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="join-field">
                                <input
                                    className="join-input"
                                    name="manager_name"
                                    placeholder="담당자"
                                    value={form.manager_name}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="join-field join-field--inline">
                                <input
                                    className="join-input"
                                    name="brn"
                                    placeholder="사업자 등록번호"
                                    value={form.brn}
                                    onChange={onChange}
                                    required
                                />
                                <button type="button" className="join-inline-btn">
                                    등록
                                </button>
                            </div>
                        </>
                    )}

                    <button className="join-submit" type="submit" disabled={loading}>
                        {loading ? "처리 중" : "회원가입"}
                    </button>

                </form>

                {/* 역할 토글 */}
                <footer className="join-footer">
                    <div className="join-role">
                        <label className={`join-role-chip ${role === "USER" ? "is-active" : ""}`}>
                            <input
                                type="radio"
                                name="role"
                                value="USER"
                                checked={role === "USER"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            일반 사용자
                        </label>
                        <label className={`join-role-chip ${role === "VENDOR" ? "is-active" : ""}`}>
                            <input
                                type="radio"
                                name="role"
                                value="VENDOR"
                                checked={role === "VENDOR"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            벤더
                        </label>
                    </div>
                </footer>
            </section>
        </main>
    );
};

export default Join;
