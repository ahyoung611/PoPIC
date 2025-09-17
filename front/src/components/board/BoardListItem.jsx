import { useEffect, useState } from "react";

const API = "http://localhost:8080";

export default function BoardListView() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchBoards();
    }, [page, keyword]);

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/board?page=${page}&size=10&keyword=${keyword}`);
            if (!res.ok) throw new Error("불러오기 실패");
            const data = await res.json();
            setBoards(data.content);
            setTotalPages(data.totalPages);
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); // 검색 시 1페이지로 초기화
        fetchBoards();
    };

    if (loading) return <div>불러오는 중...</div>;
    if (!boards.length) return <div>게시글이 없습니다.</div>;

    return (
        <div className="board-container">
            <h2 style={{ textAlign: "center", margin: "20px 0" }}>커뮤니티</h2>

            {/* 검색창 */}
            <form onSubmit={handleSearch} style={{ marginBottom: "10px", textAlign: "right" }}>
                <input
                    type="text"
                    placeholder="검색어 입력"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit">검색</button>
            </form>

            {/* 게시판 테이블 */}
            <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th>글번호</th>
                    <th>제목</th>
                    <th>글쓴이</th>
                    <th>업로드 날짜</th>
                    <th>수정 날짜</th>
                    <th>조회</th>
                </tr>
                </thead>
                <tbody>
                {boards.map((b, idx) => (
                    <tr key={b.boardId}>
                        <td>{b.boardId}</td>
                        <td>{b.title}</td>
                        <td>{b.username}</td>
                        <td>{b.createdDate}</td>
                        <td>{b.updatedDate}</td>
                        <td>{b.views}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div style={{ marginTop: "15px", textAlign: "center" }}>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        style={{
                            margin: "0 5px",
                            background: i === page ? "red" : "white",
                            color: i === page ? "white" : "black",
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
