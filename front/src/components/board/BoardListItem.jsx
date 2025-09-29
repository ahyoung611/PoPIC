// src/components/board/BoardListItem.jsx
import { useMemo } from "react";
import DOMPurify from "dompurify";
import Button from "../commons/Button.jsx";
import "../../style/board.css";

export default function BoardListItem({ item, onClick }) {
  const { boardId, title, writerName, createdAt, viewCount, content } = item;
  const dateText = createdAt
    ? new Date(createdAt).toISOString().slice(0, 10).replaceAll("-", ".")
    : "";

  // 1) 리스트 요약용: 태그 제거(텍스트만)
  const previewText = useMemo(() => {
    // 모든 태그/속성 제거
    const plain = DOMPurify.sanitize(content ?? "", {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    // 공백 정리
    return plain.replace(/\s+/g, " ").trim();
  }, [content]);

  return (
    <li className="board-card">
      <div className="board-card__head">
        <div className="board-card__main">
          <div className="board-card__title">{title}</div>
          <div className="board-card__meta">
            {writerName || "user"} | {dateText} | 조회 {viewCount ?? 0}
          </div>

          {/* 리스트에서는 텍스트 요약(3줄 클램프) */}
          <div className="board-card__desc">{previewText}</div>
        </div>

        <Button variant="ghost" color="gray" onClick={() => onClick?.(boardId)}>
          상세 보기 &#8594;
        </Button>
      </div>
    </li>
  );
}
