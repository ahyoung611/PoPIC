import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchHeader from "../../components/commons/SearchHeader";
import Pagination from "../../components/commons/Pagination";
import "../../style/vendorList.css";
import PopupCard from "../../components/vendorPopups/PopupCard.jsx";
import apiRequest from "../../utils/apiRequest.js";

// 날짜 포맷터(YYYY-MM-DD → YY.MM.DD)
const fmt = (d) => {
    if (!d) return "";
    const [y, m, day] = String(d).split("-");
    return `${y.slice(2)}.${m}.${day}`;
};

export default function VendorMain() {
    const navigate = useNavigate();
    const { vendorId } = useParams();

    // 벤더 스코프 API 엔드포인트
    const LIST_API = `/api/vendors/${vendorId}/popups`;
    const CATEGORY_API = `/api/vendors/${vendorId}/popups/categories`;

    // 검색 상태
    const [searchValue, setSearchValue] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // 페이징 상태
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // 데이터 상태(카테고리맵/카드 rows)
    const [catMap, setCatMap] = useState(new Map());
    const [rows, setRows] = useState([]);

    // 카테고리 로드
    useEffect(() => {
        (async () => {
            try {
                const list = await apiRequest(CATEGORY_API);
                setCatMap(new Map(list.map((c) => [c.id, c.name])));
            } catch (e) {
                console.error("카테고리 로드 실패:", e);
                setCatMap(new Map());
            }
        })();
    }, [CATEGORY_API]);

    // 팝업 리스트 로드
    useEffect(() => {
        (async () => {
            try {
                const data = await apiRequest(LIST_API);
                const mapped = (data || []).map((d) => {
                    const status = d.status;
                    const canEdit = status === 2 || status === 3;
                    return {
                        id: d.store_id,
                        title: d.store_name,
                        startDate: fmt(d.start_date),
                        endDate: fmt(d.end_date),
                        categories: (d.categories || [])
                            .map((cid) => catMap.get(cid))
                            .filter(Boolean),
                        status,
                        thumb: d.thumb || null,
                        imageId: d.images_detail?.[0]?.image_id,
                        canEdit,
                    };
                });
                setRows(mapped);
            } catch (e) {
                console.error("목록 로드 실패:", e);
                setRows([]);
            }
        })();
    }, [LIST_API, catMap]);

    // 검색 필터링
    const filtered = useMemo(() => {
        if (!appliedSearch.trim()) return rows;
        const kw = searchValue.trim().toLowerCase();
        return rows.filter((r) =>
            [r.title, ...(r.categories || [])]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(kw)
        );
    }, [rows, appliedSearch, searchValue]);

    // 페이징 계산
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage]);

    // 버튼 핸들러(검색/등록/수정/상세)
    const handleSearch = () => {
        setCurrentPage(1);
        setAppliedSearch(searchValue);
    };
    const handleRegister = () => navigate(`/vendor/${vendorId}/popups/new`);
    const handleEdit = (popupId) =>
        navigate(`/vendor/${vendorId}/popups/edit/${popupId}`);
    const handleView = (popupId) => navigate(`/popupStore/detail/${popupId}`);

    return (
        <div className="container">
            <div className="inner">
                <SearchHeader
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    onSearchClick={handleSearch}
                    onRegisterClick={handleRegister}
                />
                <div className="vendor-list">
                    {paged.length === 0 ? (
                        <div className="empty">표시할 팝업이 없습니다.</div>
                    ) : (
                        paged.map((p) => (
                            <PopupCard
                                key={p.id}
                                id={p.id}
                                title={p.title}
                                startDate={p.startDate}
                                endDate={p.endDate}
                                category_names={p.categories}
                                status={p.status}
                                thumb={p.thumb}
                                imageId={p.imageId}
                                onEdit={handleEdit}
                                onView={handleView}
                                canEdit={p.canEdit}
                            />
                        ))
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
