import React, { useEffect, useState } from "react";

export default function ProfileForm({ schema, initialData = {}, onChange, renderActions, edit }) {
    const [form, setForm] = useState({});

    useEffect(() => {
        setForm(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    // 입력 필드 업데이트
    const update = (k, v) => {
        const next = { ...form, [k]: v };
        setForm(next);
        onChange?.({ [k]: v });
    };

    return (
        <div>
            {schema.fields.filter(f => !f.hidden).map(f => {
                const value = form[f.name] ?? "";
                const readOnly = !!f.readOnly;
                const inputType = f.type && f.type !== "password" ? f.type : "text";

                return (
                    <div className="vp-field" key={f.name}>
                        <label className={`vp-label ${f.required ? "required":""}`}>{f.label}</label>
                        <div className="vp-input-container">
                            <input
                                className="vp-input"
                                type={inputType}
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