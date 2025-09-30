import React from "react";
import "../../style/button.css";

export default function Button({
  children,
  variant = "primary",   // primary | outline | ghost | filter | label
  color = "red",          // red | blue | gray
  selected = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",        // 기본 button 타입
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `is-${color}`,
    selected && "is-selected",
    disabled && "is-disabled",
    className,
  ].filter(Boolean).join(" ");

  // DOM에 안전하게 전달할 속성만 허용
  const safeProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) =>
      key === "title" ||
      key === "name" ||
      key === "value" ||
      key.startsWith("aria-") ||
      key.startsWith("data-")
    )
  );

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...safeProps}
    >
      {children}
    </button>
  );
}
