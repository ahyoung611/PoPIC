// src/components/vendor/PopupCard.jsx
import React from "react";
import "../..//style/vendorList.css";
import Button from "../commons/Button.jsx";

const STATUS_LABEL = {
    1: "승인 완료",
    2: "승인 대기",
    3: "승인 반려",
    0: "정지",
    [-1]: "운영 종료",
};

function statusClass(s) {
    switch (s) {
        case 1: return "status--approved";
        case 2: return "status--pending";
        case 3: return "status--rejected";
        case 0: return "status--suspended";
        case -1: return "status--ended";
        default: return "";
    }
}

export default function PopupCard({
                                      id,
                                      title,
                                      startDate,
                                      endDate,
                                      category_names = [],
                                      status = 2,
                                      thumb,
                                      onEdit,
                                      onView,
                                  }) {
    return (
        <div className="popup-card">
            <div className="popup-thumb">
                {thumb ? (
                    <img src={thumb} alt={title} />
                ) : (
                    <div className="thumb-placeholder" aria-label="이미지 없음" />
                )}
            </div>

            <div className="popup-body">
                <div className="popup-head">
                    <h3 className="popup-title">{title}</h3>
                    <span className={`status-badge ${statusClass(status)}`}>
            {STATUS_LABEL[status] ?? "상태 미정"}
          </span>
                </div>

                <div className="popup-meta">
          <p className="date">
            {startDate} - {endDate}
          </p>
            <div>
                {category_names?.length > 0 && (
                    <div className="chips">
                        {category_names.map((c, i) => (
                            <span className="chip" key={i}>{c}</span>
                        ))}
                    </div>
                )}
            </div>
                </div>

                <div className="popup-actions">
                    <Button variant="ghost" color="gray" onClick={() => onEdit?.(id)}>
                        수정
                    </Button>
                    <Button variant="ghost" color="gray" onClick={() => onView?.(id)}>
                        상세 보기
                    </Button>
                </div>
            </div>
        </div>
    );
}
