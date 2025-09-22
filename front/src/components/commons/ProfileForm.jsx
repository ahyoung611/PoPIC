import React, { useEffect, useState } from "react";

export default function ProfileForm({ schema, initialData = {}, onChange, renderActions, edit }) {
    const [form, setForm] = useState({});
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // 비밀번호 정규화
    const validatePassword = (pwd) => {
        if (!edit || !pwd) {
            return "";
        }

        if (pwd.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";

        // 영문 소문자, 숫자, 특수문자 포함
        if (!/[a-z]/.test(pwd)) return "소문자를 포함해야 합니다.";
        if (!/[0-9]/.test(pwd)) return "숫자를 포함해야 합니다.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "특수문자를 포함해야 합니다.";

        return "";
    };

    useEffect(() => {
        setForm(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    // 입력 필드 업데이트
    const update = (k, v) => {
        const newForm = { ...form, [k]: v };
        setForm(newForm);

        if (k === "password_mask") {
            const errorMsg = validatePassword(v);
            setPasswordError(errorMsg);
            onChange?.({ [k]: v, error: errorMsg });
        } else {
            onChange?.({ [k]: v });
        }
    };

    return (
        <div>
            {schema.fields.filter(f => !f.hidden).map(f => {
                const value = form[f.name] ?? "";
                const readOnly = !!f.readOnly;
                const isPasswordField = f.type === "password";

                return (
                    <div className="vp-field" key={f.name}>
                        <label className={`vp-label ${f.required ? "required":""}`}>{f.label}</label>
                        <div className="vp-input-container">
                            <input
                                className="vp-input"
                                type={isPasswordField && !passwordVisible ? "password" : "text"}
                                placeholder={f.placeholder}
                                value={value}
                                readOnly={readOnly}
                                onChange={(e) => update(f.name, e.target.value)}
                                style={{
                                    backgroundColor: readOnly ? "#f5f5f5" : undefined,
                                    color: readOnly ? "#888" : undefined,
                                    cursor: readOnly ? "not-allowed" : "text"
                                }}
                            />
                            {/* 수정 모드 - 눈 아이콘을 표시 */}
                            {isPasswordField && edit && (
                                <img
                                    src={passwordVisible ? "/eye.png" : "/nonEye.png"}
                                    alt="비밀번호 보기/숨기기"
                                    className="vp-password-toggle-img"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                />
                            )}
                            {/* 비밀번호 에러 메시지 */}
                            {isPasswordField && passwordError && (
                                <div className="vp-help" style={{ color: "red" }}>{passwordError}</div>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="vp-actions">
                {renderActions ? renderActions() : null}
            </div>
        </div>
    );
}