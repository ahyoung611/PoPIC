import {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import "../../style/myPosts.css";
import {useNavigate} from "react-router-dom";
import Pagination from "../../components/commons/Pagination.jsx";
import Button from "../../components/commons/Button.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;
const PAGE_SIZE = 4;

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

function getPopupThumb(r) {
  const popupImageId =
    r.store?.images?.[0] ??
    r.popup?.images?.[0] ??
    r.store?.imageIds?.[0] ??
    r.popup?.imageIds?.[0] ??
    null;
  return popupImageId ? `${URL}/images?id=${popupImageId}&type=popup` : "";
}

const MyReviews = () => {
  const {auth, getToken} = useAuth();
  const token = getToken();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1); // UI 1-base
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const userId = auth?.user?.user_id;
    if (!userId) return;

    const apiPage = page - 1;
    fetch(`${URL}/popupStore/user/${userId}?page=${apiPage}&size=${PAGE_SIZE}&sortBy=createdAt&direction=desc`, {
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        setReviews(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalCount(data.totalElements ?? (data.content?.length || 0));
      })
      .catch(err => console.error("내 리뷰 조회 실패", err));
  }, [token, auth?.user?.user_id, page]);

  const goDetail = (storeId) => {
    nav(`/popupStore/detail/${storeId}`, { state: { tab: "리뷰" } });
  };

  const effectiveTotalPages = totalPages || Math.ceil(totalCount / PAGE_SIZE);
  const showPagination = totalCount >= 4 && effectiveTotalPages > 1;

  return (
    <div className="container">
      <div className="inner">
        <div className="myPosts">
          <h1 className="page-title">나의 리뷰</h1>
          <div className="myPosts-count">내가 남긴 리뷰 <strong>{totalCount}</strong>개</div>

          <div className={`myPosts-list ${reviews?.length ? "" : "is-empty"}`}>
            {Array.isArray(reviews) && reviews.length > 0 ? (
              reviews.map((r) => {
                const excerptText = getFirstParagraph(r.contentHtml ?? r.content);
                const thumbSrc = getPopupThumb(r);

                return (
                  <div key={r.review_id} className="myPosts-card card">
                    <div className="thumb">
                      {thumbSrc && (
                        <img
                          src={thumbSrc}
                          alt="팝업 썸네일"
                          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                        />
                      )}
                    </div>

                    <div className="body">
                      <div className="head-row">
                        <div className="title-group">
                          <div className="store">[{r.store?.store_name ?? r.storeName}]</div>
                          <div className="subject">{r.title}</div>
                        </div>
                        <div className="meta-top">
                          <span>{r.user?.name || "user1"}</span>
                          <span className="bar">|</span>
                          <span>{formatDate(r.createdAt)}</span>
                        </div>
                      </div>

                      <div className="excerpt">{excerptText}</div>

                      <div className="foot-row">
                        <Button
                          variant="ghost"
                          onClick={() => goDetail(r.store?.store_id)}
                          aria-label="리뷰 더보기"
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
                <p className="no-posts">작성한 리뷰가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {showPagination && (
            <Pagination
              currentPage={page}
              totalPages={effectiveTotalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviews;
