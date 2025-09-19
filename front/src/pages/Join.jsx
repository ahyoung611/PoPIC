import { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../style/join.css";
import eye from "../../public/eye.png"
import nonEye from "../../public/nonEye.png"
import logo from "../../public/popic-logo.png"
import apiRequest from "../utils/apiRequest.js" // ← 헬퍼 경로 맞게 수정
import $ from "jquery"

const Join = () => {
    const [params] = useSearchParams();
    const init = params.get("role") === "VENDOR" ? "VENDOR" : "USER";
    const [role, setRole] = useState(init);
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);
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

    const [brnVerified, setBrnVerified] = useState(false);
    const brnRef = useRef(null); // 인풋 DOM 참조


    // 핸드폰 패턴
    const PHONE_PATTERN = String.raw`^(?:01[0-9]-?\d{3,4}-?\d{4}|01[0-9]\d{7,8})$`;
    // 사업자등록번호 패턴
    const BRN_PATTERN = String.raw`^\d{3}-?\d{2}-?\d{5}$`;

    // 비밀번호 onChange 핸들러 기도메타타타ㅏ타타타ㅏ
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setForm((f) => ({ ...f, password: value }));

    };

    const businessNumberCheck = () => {
        const input = brnRef.current;                // 인풋 DOM
        // const clean = (form.brn || "").replace(/-/g, "");
        const clean = (form.brn || "").replace(/\D/g, "");

        if (clean.length !== 10) {
            input.setCustomValidity("사업자등록번호 10자리를 입력해주세요.");
            input.reportValidity();
            return;
        }

        const url = "https://api.odcloud.kr/api/nts-businessman/v1/status"
            + "?serviceKey=u%2FoWK2f4UUhnQFKqgTJe96B2%2FNKnFcWOyEX01AFuPBGp8mH1%2B14dEoJJQCU5flSkJ%2Ba7YDazsdLnCR3sgnYwZQ%3D%3D";

        $.ajax({
            url,
            type: "POST",
            data: JSON.stringify({ b_no: [clean] }),
            dataType: "json",
            contentType: "application/json",
            success: function (result) {
                const item = result?.data?.[0];

                if (!item) {
                    input.setCustomValidity("인증 결과를 확인할 수 없습니다.");
                    input.reportValidity();
                    return;
                }
                // 국세청 등록된 사업자
                const ok =
                    typeof item?.tax_type === "string" &&
                    (item.tax_type.includes("부가가치세") || item.tax_type === "부가가치세");

                if (ok) {
                    input.setCustomValidity("");
                    setBrnVerified(true);
                } else {
                    input.setCustomValidity("등록되지 않은 사업자 번호입니다.");
                    input.reportValidity();
                }
            },
            error: function () {
                input.setCustomValidity("인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                input.reportValidity();
            },
        });
    };


    /* 비밀번호 보이기/숨기기 토글 전환 */
    const togglePassword = (e) => {
        setShowPw((prevState) => !prevState);
    }

    /* 비밀번호 제외 input 태그 */
    const onChange = (e) => {
        const { name, value } = e.target;
        // if (name !== "password") {
        //     setForm((f) => ({ ...f, [name]: value }));
        // }
        // ★ BRN이 바뀌면 인증상태 초기화 + 에러 메시지 세팅
        if (name === "brn") {
            setBrnVerified(false);
            // DOM 있을 때만 메시지 넣기
            if (brnRef.current) {
                brnRef.current.setCustomValidity("사업자등록번호 인증을 먼저 완료해주세요.");
            }
        }

        if (name !== "password") {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    /* 진입 role 확인 */
    const onSubmit = async (e) => {
        e.preventDefault();

        // ★ VENDOR인데 인증이 안 되었으면 즉시 차단
        if (role === "VENDOR" && !brnVerified) {
            console.log("▶ VENDOR 미인증 상태 - 제출 차단");
            if (brnRef.current) {
                brnRef.current.setCustomValidity("사업자등록번호 인증을 먼저 완료해주세요.");
                brnRef.current.reportValidity();
            }
            return; // ★ 여기서 API 호출 막음
        }

        // 폼 DOM 자체의 검증 상태 확인
        const formEl = e.target;
        if (!formEl.reportValidity()) {
            return;
        }

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
            navigate("/login");

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
            setBrnVerified(false);
        } catch (err) {
            alert("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="join">
            <section className="join-card">
                <header className="join-header">
                    <img className="join-logo" src={logo} alt="PoPiC" />
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
                            pattern="(?=.{8,})(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*"
                            placeholder="비밀번호"
                            title="비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다."
                            value={form.password}
                            onChange={handlePasswordChange}
                            required
                            // minLength={8}
                        />
                        <button
                            type="button"
                            className="join-icon-btn"
                            aria-label="비밀번호 표시"
                            onClick={togglePassword}
                            title="비밀번호 표시"
                        >
                            <img
                                src={showPw ? eye : nonEye}
                                alt={showPw ? "비밀번호 보임" : "비밀번호 숨김"}
                            />
                        </button>
                    </div>

                    {/* 전화번호 */}
                    <div className="join-field">
                        <input
                            className="join-input"
                            name="phone_number"
                            pattern={PHONE_PATTERN}
                            placeholder="핸드폰번호"
                            title="휴대폰(예: 010-1234-5678 또는 01012345678) 형식으로 입력하세요"
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
                                    ref={brnRef}
                                    name="brn"
                                    maxLength="12"
                                    pattern={BRN_PATTERN}
                                    placeholder="사업자 등록번호"
                                    title="사업자등록번호 형식에 맞게 입력하세요 (예: 123-45-67890 또는 1234567890) 형식으로 입력하세요"
                                    value={form.brn}
                                    onChange={onChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="join-inline-btn"
                                    onClick={businessNumberCheck}
                                    disabled={brnVerified || !form.brn}
                                >
                                    {brnVerified ? "인증 완료" : "인증"}
                                </button>
                            </div>
                        </>
                    )}

                    <button className="join-submit" type="submit" disabled={loading}>
                        {loading ? "처리 중" : "회원가입"}
                    </button>

                </form>
            </section>
        </main>
    );
};

export default Join;
