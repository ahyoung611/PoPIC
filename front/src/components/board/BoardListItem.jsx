export default function BoardListItem({ item, onClick }) {
    const { boardId, title, writerName, createdAt, viewCount, content } = item;
    const dateText = createdAt
        ? new Date(createdAt).toISOString().slice(0, 10).replaceAll("-", ".")
        : "";

    return (
        <li className="board-card">
            <div className="board-card__head">
                <div className="board-card__main">
                    <div className="board-card__title">{title}</div>
                    <div className="board-card__meta">
                        {writerName || "user"} | {dateText} | 조회 {viewCount ?? 0}
                    </div>
                    <div className="board-card__desc">{content}</div>
                </div>
                <button
                    type="button"
                    className="board-card__more"
                    onClick={() => onClick?.(boardId)}
                >
                    상세보기 &gt;
                </button>
            </div>
        </li>
    );
}
