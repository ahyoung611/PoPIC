import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchHeader from "../../components/commons/SearchHeader";
import Pagination from "../../components/commons/Pagination";
import "../../style/vendorList.css";
import VendorPopupCard from "../../components/vendorPopups/VendorPopupCard.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";

// 날짜 포맷터(YYYY-MM-DD → YY.MM.DD)
const fmt = (d) => {
    if (!d) return "";
    const [y, m, day] = String(d).split("-");
    return `${y.slice(2)}.${m}.${day}`;
};

export default function VendorMain() {
    const navigate = useNavigate();
    const { vendorId } = useParams();
    const token = useAuth().getToken();

    // 벤더 API 엔드포인트
    const LIST_API = `/api/vendors/${vendorId}/popups`;
    const CATEGORY_API = `/api/vendors/${vendorId}/popups/categories`;

    // 검색 상태
    const [searchValue, setSearchValue] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // 페이징 상태
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // 데이터 상태
    const [catMap, setCatMap] = useState(new Map());
    const [rows, setRows] = useState([]);

    // 카테고리 로드
    useEffect(() => {
        (async () => {
            try {
                const list = await apiRequest(CATEGORY_API, {}, token);
                setCatMap(new Map(list.map((c) => [c.id, c.name])));
            } catch (e) {
                console.error("카테고리 로드 실패:", e);
                setCatMap(new Map());
            }
        })();
    }, [CATEGORY_API, token]);

    // 팝업 리스트 로드
    useEffect(() => {
        (async () => {
            try {
                const data = await apiRequest(LIST_API, {}, token);
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
    }, [LIST_API, catMap, token]);

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

    // 버튼 핸들러
    const handleSearch = () => {
        setCurrentPage(1);
        setAppliedSearch(searchValue);
    };

    const handleRegister = async () => {
        try {
            const v = await apiRequest(`/api/vendors/${vendorId}`, {}, token);
            if (!v || Number(v.status) !== 1) {
                alert("승인 완료된 운영자만 팝업을 등록할 수 있습니다.");
                return;
            }
            navigate(`/vendor/${vendorId}/popups/new`);
        } catch (e) {
            console.error(e);
            alert("운영자 상태를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const handleEdit = (popupId) =>
        navigate(`/vendor/${vendorId}/popups/edit/${popupId}`);
    const handleView = (popupId) =>
        navigate(`/popupStore/detail/${popupId}`);

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
                            <VendorPopupCard
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
                                token={token} // 이미지 fetch용 token 전달
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
