import React from "react";
import "../../style/select.css";

export default function Select({
                                   options = [],          // ["전체","승인","반려"] 또는 [{label, value, disabled}]
                                   value = "",
                                   onChange,
                                   placeholder,           // 필요하면 "선택" 등
                                   className = "",
                                   ...props
                               }) {
    const toOption = (opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt;

    return (
        <div className={`select ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => {
                    const o = toOption(opt);
                    return (
                        <option key={o.value ?? o.label} value={o.value} disabled={o.disabled}>
                            {o.label}
                        </option>
                    );
                })}
            </select>
            <span className="select__icon" aria-hidden></span>
        </div>
    );
}
