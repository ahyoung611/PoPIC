// src/views/board/BoardList.jsx
import { useEffect, useMemo, useState } from "react";
import BoardListItem from "../../components/board/BoardListItem.jsx";
import Select from "../../components/commons/Select.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// 공통
import SearchHeader from "../../components/commons/SearchHeader.jsx";
import Pagination from "../../components/commons/Pagination.jsx";

// 스타일


const host =
  (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const API =
  (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const token = auth?.token;

  // 입력 전용 / 실제 요청
  const [kwInput, setKwInput] = useState("");
  const [kwQuery, setKwQuery] = useState("");

  // 검색 범위: tc=제목+내용, title=제목, content=내용
  const [scope, setScope] = useState("tc");

  // 서버는 0-based, UI는 1-based 사용 -> 변환 주의
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(0);
  const size = 5;

  const isEmpty = useMemo(() => !loading && boards.length === 0, [loading, boards]);

  useEffect(() => {
    if (!token) return;
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

        const res = await fetch(`${API}/board?${qs}`, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
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
  }, [kwQuery, scope, page, token]);

  const submitSearch = () => {
    setPage(0); // 검색 시 첫 페이지로
    setKwQuery(kwInput.trim());
  };

  const goCreate = () => (window.location.href = "/board/new");
  const goDetail = (id) => (window.location.href = `/board/${id}`);

  // Pagination 컴포넌트는 1-based currentPage를 받음
  const currentPage = page + 1;
  const handlePageChange = (nextPage1Based) => {
    setPage(nextPage1Based - 1);
  };

  return (
    <div className="container100">
      <div className="inner">
        <h2 className="board__title">커뮤니티</h2>

        {/* 상단 도구영역: 범위+검색 */}
         <div className="list-controls" style={{ display: "flex", gap: "5px" }}>
          <Select
           id="scope"
           value={scope}
           onChange={setScope}
           options={[
             { label: "전체", value: "tc" },
             { label: "제목", value: "title" },
             { label: "내용", value: "content" },
           ]}
           style={{ height: 36 }}
         />
          <SearchHeader
            className="board__search-header"
            searchValue={kwInput}
            onSearchChange={setKwInput}
            onSearchClick={submitSearch}
            onRegisterClick={goCreate}
            placeholder="검색할 내용을 입력해주세요."
            showRegister
          />
        </div>

        {/* 리스트 */}
        <ul className="board-list" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <li className="board-empty">불러오는 중...</li>
          ) : isEmpty ? (
            <li className="board-empty">게시글이 없습니다.</li>
          ) : (
            boards.map((b) => (
              <BoardListItem
                key={b.boardId}
                item={b}
                onClick={(id) => goDetail(id)}
              />
            ))
          )}
        </ul>

        {/* 페이지네이션: 공통 컴포넌트 사용 */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
