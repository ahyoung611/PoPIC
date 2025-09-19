import React from "react";

export default function QuickActions() {
    return (
        <div className="card actions">
            <a className="action" href="/me/popic">
                <div className="icon">
                    <img src="/popic-icon.png" alt="나의 팝픽" />
                </div>
                <div className="label">나의 팝픽</div>
            </a>

            <a className="action" href="/me/reviews">
                <div className="icon">
                    <img src="/review-icon.png" alt="나의 리뷰" />
                </div>
                <div className="label">나의 리뷰</div>
            </a>

            <a className="action" href="/me/posts">
                <div className="icon" >
                    <img src="/post-icon.png" alt="나의 글" />
                </div>
                <div className="label">나의 글</div>
            </a>
        </div>
    );
}
