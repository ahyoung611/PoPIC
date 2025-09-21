import React, { useEffect, useState } from "react";

export default function ProfileForm({ schema, initialData = {}, onChange, renderActions }) {
    // 상태 관리
    const [form, setForm] = useState({});
    // 초기 데이터 동기화
    useEffect(() => setForm(prev => ({ ...prev, ...initialData })), [initialData]);
    // 비밀번호 업데이트
    const update = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        onChange?.({
            [k]: v,
            ...(k === "password_mask" ? { password: v } : {})
        });
    };

    return (
        <div>
            {schema.fields.filter(f => !f.hidden).map(f => {
                const value = form[f.name] ?? "";
                const readOnly = !!f.readOnly;

                return (
                    <div className="vp-field" key={f.name}>
                        <label className={`vp-label ${f.required ? "required":""}`}>{f.label}</label>
                        <input
                            className="vp-input"
                            type={f.type ?? "text"}
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
                        {f.help && <div className="vp-help">{f.help}</div>}
                    </div>
                );
            })}

            <div className="vp-actions">{renderActions?.()}</div>
        </div>
    );
}
