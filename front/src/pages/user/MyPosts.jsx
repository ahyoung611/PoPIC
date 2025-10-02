import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import "../../style/myPosts.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import Pagination from "../../components/commons/Pagination.jsx";

const host =
  (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL =
  (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const PAGE_SIZE = 5;

function formatDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function getFirstParagraph(htmlOrText) {
  if (!htmlOrText) return "";
  try {
    if (!/<[a-z][\s\S]*>/i.test(htmlOrText)) {
      return String(htmlOrText).replace(/\s+/g, " ").trim();
    }
    const doc = new DOMParser().parseFromString(htmlOrText, "text/html");
    const p = doc.querySelector("p");
    const text = (p?.textContent ?? doc.body?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();
    return text;
  } catch {
    return String(htmlOrText)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

const MyPosts = () => {
  const { auth, getToken } = useAuth();
  const token = getToken();
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // UI 1-base
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const userId = auth?.user?.user_id;
    if (!userId) return;

    const apiPage = page - 1; // API 0-base
    fetch(
      `${URL}/board/user/${userId}?page=${apiPage}&size=${PAGE_SIZE}&sortBy=created_at&direction=desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalCount(data.totalElements ?? (data.content?.length || 0));
      })
      .catch((err) => console.error("게시글 내역 조회 실패", err));
  }, [token, auth?.user?.user_id, page]);

  const showPagination = totalCount >= PAGE_SIZE && totalPages > 1;
  useEffect(() => { console.log('posts sample', posts[0]); }, [posts]);

  return (
    <div className="container">
      <div className="inner">
        <div className="myPosts">
          <h1 className="page-title">나의 게시글</h1>
          <div className="myPosts-count">
            내가 작성한 글 <strong>{totalCount}</strong>개
          </div>

          <div className={`myPosts-list ${posts?.length ? "" : "is-empty"}`}>
            {Array.isArray(posts) && posts.length > 0 ? (
              posts.map((p) => {
                const excerpt = getFirstParagraph(p.contentHtml ?? p.content);
                return (
                  <div key={p.boardId} className="myPosts-card no-thumb card">
                    <div className="body">
                      <div className="head-row">
                        <div className="title-group">
                          <div className="subject">{p.title}</div>
                        </div>
                        <div className="meta-top">
                          <span>{p.user?.name || "익명"}</span>
                          <span className="bar">|</span>
                          <span>{formatDate(p.createdAt)}</span>
                        </div>
                      </div>

                      <div className="excerpt">{excerpt}</div>

                      <div className="foot-row">
                        <Button
                          variant="ghost"
                          onClick={() => nav(`/board/${p.boardId}`)}
                        >
                          상세보기 &gt;
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p className="no-posts">작성한 글이 없습니다.</p>
              </div>
            )}
          </div>

          {showPagination && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;
