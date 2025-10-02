import React from "react";

const items = [
  {
    href: "/me/popic",
    label: "나의 팝픽",
    icon: "/quickAction-icon/popic-icon.png",
    hoverIcon: "/quickAction-icon/popic-icon-active.png",
    alt: "나의 팝픽",
  },
  {
    href: "/me/reviews",
    label: "나의 리뷰",
    icon: "/quickAction-icon/review-icon.png",
    hoverIcon: "/quickAction-icon/review-icon-active.png",
    alt: "나의 리뷰",
  },
  {
    href: "/me/posts",
    label: "나의 글",
    icon: "/quickAction-icon/post-icon.png",
    hoverIcon: "/quickAction-icon/post-icon-active.png",
    alt: "나의 글",
  },
];

export default function QuickActions() {
  const swap = (e, type) => {
    const img = e.currentTarget.querySelector("img");
    if (!img) return;
    const normal = img.getAttribute("data-normal");
    const hover = img.getAttribute("data-hover");
    img.src = type === "enter" ? hover || normal : normal;
  };

  return (
    <div className="actions">
      {items.map((it) => (
        <a
          key={it.href}
          className="action"
          href={it.href}
          onMouseEnter={(e) => swap(e, "enter")}
          onMouseLeave={(e) => swap(e, "leave")}
        >
          <div className="icon">
            <img
              src={it.icon}
              data-normal={it.icon}
              data-hover={it.hoverIcon}
              alt={it.alt}
              loading="lazy"
            />
          </div>
          <div className="label">{it.label}</div>
        </a>
      ))}
    </div>
  );
}
