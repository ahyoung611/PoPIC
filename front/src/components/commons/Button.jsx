import React from "react";
import "../../style/button.css";

export default function Button({
                                   children,
                                   variant = "primary",   // primary | outline | ghost | filter | label
                                   color = "red",         // red | blue | gray
                                   selected = false, // 필터 버튼 선택 상태
                                   disabled = false, // 비활성화 상태
                                   className = "",
                                   onClick,
                                   ...props
                               }) {
    const classes = [
        "btn",                   // 기본 버튼 클래스
        `btn--${variant}`,       // primary | outline | ghost | filter | label
        `is-${color}`,           // red | blue | gray
        selected && "is-selected",
        disabled && "is-disabled",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            className={classes}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {/* 버튼 안 텍스트 */}
            {children}
        </button>
    );
}
