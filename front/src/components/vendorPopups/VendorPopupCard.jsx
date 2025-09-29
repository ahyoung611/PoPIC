import React from "react";
import "../../style/vendorList.css";
import Button from "../commons/Button.jsx";

// 상태
const STATUS_META = {
    1: { text: "승인 완료",  color: "blue" },
    2: { text: "승인 대기",  color: "gray" },
    3: { text: "승인 반려",  color: "red"  },
    0: { text: "정지",      color: "red"  },
    [-1]: { text: "운영 종료", color: "gray" },
};

export default function VendorPopupCard({
        id,
        title,
        startDate,
        endDate,
        category_names = [],
        status = 2,
        thumb,
        onEdit,
        onView,
        imageId,
        canEdit = false,  // 수정 가능 여부(승인 대기/반려만 true)
    }) {
    const meta = STATUS_META[status] ?? { text: "상태 미정", color: "gray" };

    return (
        <div className="popup-card">
            <div className="popup-thumb">
                {thumb ? (
                    <img
                        src={`http://localhost:8080/images?type=popup&id=${imageId}`}
                        alt={title}
                    />
                ) : (
                    <div className="thumb-placeholder" aria-label="이미지 없음" />
                )}
            </div>

            <div className="popup-body">
                <div className="popup-head">
                    <h3 className="popup-title">{title}</h3>

                    {/* 상태 라벨 버튼 */}
                    <Button
                        variant="label"
                        color={meta.color}
                        disabled
                        aria-label={`상태: ${meta.text}`}
                        style={{ cursor: "default" }}
                    >
                        {meta.text}
                    </Button>
                </div>

                <div className="popup-meta">
                    <p className="date">
                        {startDate} - {endDate}
                    </p>

                    {category_names?.length > 0 && (
                        <div className="chips">
                            {category_names.map((c, i) => (
                                <span className="chip" key={i}>
                  {c}
                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="popup-actions">
                    {/* 승인 대기/반려에서만 수정 가능 */}
                    {canEdit && (
                        <Button variant="ghost" color="gray" onClick={() => onEdit?.(id)}>
                            수정
                        </Button>
                    )}
                    <Button variant="ghost" color="gray" onClick={() => onView?.(id)}>
                        상세 보기
                    </Button>
                </div>
            </div>
        </div>
    );
}
