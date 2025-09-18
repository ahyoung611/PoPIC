import {useEffect, useState, useRef} from "react";

const host = window.location.hostname || "localhost";
const API = import.meta?.env?.VITE_API_BASE_URL?.trim() || `http://${host}:8080`;

function BoardComment({boardId}) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    const fetchComments = async () => {
        if (!boardId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/board/${boardId}/comments`);
            if (!res.ok) throw new Error("댓글 불러오기 실패");
            const list = await res.json();
            setItems(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const content = value.trim();
        if (!content) return;

        setPosting(true);
        try {
            const res = await fetch(`${API}/board/${boardId}/comments`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ content }),
            });
            if (!res.ok) throw new Error("등록 실패");
            setValue("");
            await fetchComments();
        } catch (e) {
            console.error(e);
            alert(e.message || "댓글 등록 실패");
        } finally {
            setPosting(false);
        }
    };

    const onDelete = async (commentId) => {
        if (!window.confirm("이 댓글을 삭제할까요?")) return;
        const backup = items;
        setItems((prev) => prev.filter((c) => c.commentId !== commentId));
        try {
            const res = await fetch(`${API}/board/${boardId}/comments/${commentId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("삭제 실패");
            fetchComments();
        } catch (e) {
            console.error(e);
            alert("삭제에 실패했습니다.");
            setItems(backup);
        }
    };

    return (
        <div className="be-comments">
            <h3 className="be-comments-title">댓글</h3>

            <form className="be-comment-form" onSubmit={onSubmit}>
                <input
                    ref={inputRef}
                    className="be-input be-comment-input"
                    placeholder="댓글 작성"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) onSubmit(e);
                    }}
                    disabled={posting}
                />
                <button className="be-btn be-btn-primary" disabled={posting}>
                    {posting ? "등록 중..." : "등록"}
                </button>
            </form>

            {loading ? (
                <div className="be-empty">불러오는 중…</div>
            ) : items.length === 0 ? (
                <div className="be-empty">첫 댓글을 남겨보세요.</div>
            ) : (
                <ul className="be-comment-list">
                    {items.map((c) => (
                        <li key={c.commentId} className="be-comment-item">
                            <div className="be-comment-meta">
                                <span className="be-comment-author">{c.writerName}</span>
                                <span className="be-comment-date">
                  {String(c.createdAt ?? "").slice(0, 10)}
                </span>
                            </div>
                            <div className="be-comment-content">{c.content}</div>
                            <button
                                type="button"
                                className="be-btn be-btn-ghost be-comment-delete"
                                onClick={() => onDelete(c.commentId)}
                                title="삭제"
                            >
                                삭제
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BoardComment;