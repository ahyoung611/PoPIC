import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchHeader from "../../components/commons/SearchHeader";
import Pagination from "../../components/commons/Pagination";
import "../../style/vendorList.css";
import PopupCard from "../../components/vendorPopups/PopupCard.jsx";
import apiRequest from "../../utils/apiRequest.js";

const LIST_API = "/api/vendorPopups";                // GET: PopupDTO[]
const CATEGORY_API = "/api/vendorPopups/categories"; // GET: [{id,name}]

const fmt = (d) => {
    // LocalDate 형태('2025-09-09')를 '25.09.09'로
    if (!d) return "";
    const [y, m, day] = String(d).split("-");
    return `${y.slice(2)}.${m}.${day}`;
};

export default function VendorMain() {
    const navigate = useNavigate();

    // 검색
    const [searchValue, setSearchValue] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // 데이터
    const [catMap, setCatMap] = useState(new Map());
    const [rows, setRows] = useState([]); // 가공된 카드 데이터

    // 카테고리 맵 로드
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
    }, []);

    // 팝업 리스트 로드
    useEffect(() => {
        (async () => {
            try {
                const data = await apiRequest(LIST_API);
                const mapped = (data || []).map((d) => ({
                    id: d.store_id,
                    title: d.store_name,
                    startDate: fmt(d.start_date),
                    endDate: fmt(d.end_date),
                    categories: (d.categories || [])
                        .map((cid) => catMap.get(cid))
                        .filter(Boolean),
                    status: d.status,
                    thumb: d.thumb || null,
                }));
                setRows(mapped);
            } catch (e) {
                console.error("목록 로드 실패:", e);
                setRows([]);
            }
        })();
    }, [catMap]); // 카테고리 맵 로딩 이후에 매핑

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
    }, [rows, appliedSearch]);

    // 페이징
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage]);

    // 액션
    const handleSearch = () => {
        setCurrentPage(1);
        setAppliedSearch(searchValue);
    };
    const handleRegister = () => navigate("/vendorPopups/new");
    const handleEdit = (id) => navigate(`/vendorPopups/edit/${id}`);
    const handleView = (id) => navigate(`/popupStore/detail/${id}`);

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
                                onEdit={handleEdit}
                                onView={handleView}
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
