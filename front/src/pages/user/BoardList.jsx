import {useEffect, useState} from "react";
import BoardListItem from "../../components/board/BoardListItem.jsx";
import Select from "../../components/commons/Select.jsx";
import "../../style/board.css";
import "../../style/button.css"

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const API  = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

export default function BoardListView() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);

    // 입력 전용
    const [kwInput, setKwInput] = useState("");
    // 실제 요청에 사용하는 키워드
    const [kwQuery, setKwQuery] = useState("");

    // 검색 범위: tc=제목+내용, title=제목, content=내용
    const [scope, setScope] = useState("tc");

    // 페이징
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const size = 5;

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams({
                    page: String(page),
                    size: String(size),
                    keyword: kwQuery,
                    scope,
                });
                const token = localStorage.getItem("refreshToken");

                const res = await fetch(`${API}/board?${qs}`, {
                    signal: controller.signal,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,   // 꼭 Bearer 붙여야 함
                    },
                });

                if (!res.ok) throw new Error("불러오기 실패");
                const data = await res.json(); // Page<BoardDTO>
                setBoards(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (e) {
                if (e.name !== "AbortError") console.error(e);
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [kwQuery, scope, page]);

    const submitSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setKwQuery(kwInput.trim());
    };

    if (loading) return <div className="inner">불러오는 중...</div>;

    return (
        <div className="container100">
            <div className="inner">
                <h2 className="board__title">커뮤니티</h2>
                <div className="list__box">
                    <form onSubmit={submitSearch} className="board__toolbar">
                        <div className="board__scope">
                            <Select
                                value={scope}
                                onChange={setScope}
                                options={[
                                    {label: "전체", value: "tc"},
                                    {label: "제목", value: "title"},
                                    {label: "내용", value: "content"},
                                ]}
                                style={{height: 36}}
                            />
                        </div>

                        <input
                            className="board__search"
                            value={kwInput}
                            onChange={(e) => setKwInput(e.target.value)}
                            placeholder="검색할 내용을 입력해주세요."
                        />
                        <button type="submit" className="btn btn--ghost">검색</button>
                        <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => (window.location.href = "/board/new")}
                        >
                            등록
                        </button>
                    </form>

                    <ul className="board-list">
                        {boards.length === 0 ? (
                            <li className="board-empty">게시글이 없습니다.</li>
                        ) : (
                            boards.map((b) => (
                                <BoardListItem
                                    key={b.boardId}
                                    item={b}
                                    onClick={(id) => (window.location.href = `/board/${id}`)}
                                />
                            ))
                        )}
                    </ul>

                    <nav className="pagination" aria-label="페이지">
                        <button
                            type="button"
                            className="pagination__btn"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            ‹
                        </button>
                        {Array.from({length: totalPages}, (_, i) => (
                            <button
                                type="button"
                                key={i}
                                className={`pagination__btn ${i === page ? "is-active" : ""}`}
                                onClick={() => setPage(i)}
                                aria-current={i === page ? "page" : undefined}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="pagination__btn"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            ›
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
