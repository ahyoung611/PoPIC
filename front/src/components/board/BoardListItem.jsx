import { useMemo } from "react";
import DOMPurify from "dompurify";
import Button from "../commons/Button.jsx";
import "../../style/board.css";

export default function BoardListItem({ item, onClick }) {
  const { boardId, title, writerName, createdAt, viewCount, content } = item;
  const dateText = createdAt
    ? new Date(createdAt).toISOString().slice(0, 10).replaceAll("-", ".")
    : "";

  const previewText = useMemo(() => {
    const plain = DOMPurify.sanitize(content ?? "", {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    return plain.replace(/\s+/g, " ").trim();
  }, [content]);

  return (
    <li className="board-card">
      <div className="board-card__head">
        <div className="board-card__main">
         <div className="board-card__meta">
            {writerName || "user"} | {dateText} | 조회 {viewCount ?? 0}
          </div>
          <div className="board-card__bottom">
              <div className="board-card__title">{title}</div>
               <Button variant="ghost" color="gray" onClick={() => onClick?.(boardId)}>
                상세 보기 &gt;
              </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
