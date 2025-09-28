import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../components/commons/Select.jsx";
import SearchHeader from "../components/commons/SearchHeader.jsx";
import Pagination from "../components/commons/Pagination.jsx";
import MainPopupCardB from "../components/commons/MainPopupCardB.jsx";
import apiRequest from "../utils/apiRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../style/popupList.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const toAbs = (u) => (u?.startsWith("http") ? u : `${API_BASE_URL}${u?.startsWith("/") ? "" : "/"}${u || ""}`);
const formatYmdDots = (s) => (s ? String(s).slice(0, 10).replaceAll("-", ".") : "");

const CATEGORY_JSON = [
  { category_id: "1", name: "패션" },
  { category_id: "2", name: "뷰티" },
  { category_id: "3", name: "식음료" },
  { category_id: "4", name: "라이프" },
  { category_id: "5", name: "테크" },
  { category_id: "6", name: "예술" },
  { category_id: "7", name: "취미" },
  { category_id: "8", name: "캐릭터" },
];
const CATEGORY_TABS = [{ key: "all", label: "전체" }, ...CATEGORY_JSON.map(c => ({ key: String(c.category_id), label: c.name }))];

export default function PopupList() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth?.user?.user_id;
  const token = auth?.token;

  // 상태
  const [categoryKey, setCategoryKey] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [page, setPage] = useState(1);

  // 반응형 컬럼 수
 const [cols, setCols] = useState(2);
 const PER_PAGE = cols * 2;

  // 컬럼 수 계산
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w <= 560) setCols(2);   // 모바일 2컬럼
      else if (w <= 1024) setCols(3); // 태블릿 3컬럼
      else setCols(4);             // PC 4컬럼
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

    // 검색 적용
    const filtered = useMemo(() => {
      const q = searchValue.trim().toLowerCase();
      if (!q) return allItems;
      return allItems.filter((it) => it.title?.toLowerCase().includes(q));
    }, [allItems, searchValue]);

    // 페이지네이션 계산 (filtered 이후)
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

    const paged = useMemo(() => {
      const start = (page - 1) * PER_PAGE;
      return filtered.slice(start, start + PER_PAGE);
    }, [filtered, page, PER_PAGE]);

  // 내 북마크 불러오기
  const fetchBookmarks = useCallback(async () => {
    if (!userId || !token) {
      setBookmarked(new Set());
      return;
    }
    try {
      const data = await apiRequest(`/userBookmark/popupList`, {}, token);
      const ids = Array.isArray(data) ? data.map((item) => Number(item.store_id)) : [];
      setBookmarked(new Set(ids));
    } catch (e) {
      console.error("북마크 불러오기 실패", e);
      setBookmarked(new Set());
    }
  }, [userId, token]);

  // 카테고리별 목록 불러오기
  const fetchByCategory = useCallback(async (key) => {
    const endpoint = key && key !== "all" ? `/popupStore/category?category=${key}` : "/popupStore/monthly";
    const data = await apiRequest(endpoint, {});
    return (Array.isArray(data) ? data : []).map((item) => ({
      id: Number(item.store_id),
      image: toAbs(item.thumb),
      title: item.store_name,
      periodText: `${formatYmdDots(item.start_date)} - ${formatYmdDots(item.end_date)}`,
      categoryLabel: item.category_names?.[0] || "",
    }));
  }, []);

  // 목록 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        await fetchBookmarks();
        const list = await fetchByCategory(categoryKey);
        if (alive) {
          setAllItems(list);
          setPage(1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [categoryKey, fetchByCategory, fetchBookmarks]);

  // 북마크 토글
  const handleToggleBookmark = useCallback(async (popupId, nextState) => {
    const idNum = Number(popupId);
    setBookmarked((prev) => {
      const s = new Set(prev);
      if (nextState) s.add(idNum); else s.delete(idNum);
      return s;
    });

    if (!token || !userId) return;
    try {
      await apiRequest(`/userBookmark/toggle?userId=${userId}&storeId=${idNum}`, { method: "POST" }, token);
    } catch (e) {
      console.error("북마크 저장 실패", e);
      setBookmarked((prev) => {
        const s = new Set(prev);
        if (nextState) s.delete(idNum); else s.add(idNum);
        return s;
      });
    }
  }, [token, userId]);

  const goDetail = (id) => navigate(`/popupStore/detail/${id}`);
  const onSearchClick = () => setPage(1);

  return (
    <div className="container">
        <div className="inner">
      <div className="popup-list">
        <h1 className="list-title">ALL POPUP</h1>

        <div className="list-controls" style={{ display: "flex", gap: "5px" }}>
          <Select
            options={CATEGORY_TABS.map(t => ({ label: t.label, value: t.key }))}
            value={categoryKey}
            onChange={setCategoryKey}
            className="list-controls__category"
          />
          <SearchHeader
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onSearchClick={onSearchClick}

          />
        </div>

        {loading ? (
          <div className="popup-grid">
            {Array.from({ length: cols * 2 }).map((_, i) => (
              <div key={i} className="popup-card--skeleton" />
            ))}
          </div>
        ) : (
          <div className="popup-grid">
            {paged.length === 0 ? (
              <div className="nonList">
                검색 결과가 없습니다.
              </div>
            ) : (
              paged.map((item) => (
                <div key={item.id} className="popup-grid__cell">
                  <MainPopupCardB
                    popupId={item.id}
                    alt={item.title}
                    category={item.categoryLabel}
                    bookmarked={bookmarked.has(Number(item.id))}
                    onToggleBookmark={handleToggleBookmark}
                    periodText={item.periodText}
                    title={item.title}
                    onClick={() => goDetail(item.id)}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
        <div className="list-pagination">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
    </div>
  );
}
