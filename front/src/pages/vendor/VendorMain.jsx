import React, { useEffect, useState } from "react";
import SearchHeader from "../../components/commons/SearchHeader";
import Pagination from "../../components/commons/Pagination";
import Select from "../../components/commons/Select.jsx";

export default function VendorMain() {
    const [searchValue, setSearchValue] = useState("");
    const [sort, setSort] = useState("");           // ✅ 정렬 상태 추가
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 5;

    const handleSearch = () => {
        console.log("검색 실행:", { searchValue, sort });
        // TODO: API 호출 or 필터링
    };

    const handleRegister = () => {
        console.log("등록 버튼 클릭");
    };

    // ✅ 검색/정렬 변경 시 1페이지로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, sort]);

    return (
        <div className="container">
            <div className="inner">

                {/* 정렬 셀렉트 */}
                <Select
                    value={sort}
                    onChange={setSort}
                    options={[
                        { label: "선택", value: "" },
                        { label: "승인", value: "approved" },
                        { label: "반려", value: "rejected" },
                    ]}
                    aria-label="정렬"
                />

                {/* 검색 + 등록 */}
                <SearchHeader
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    onSearchClick={handleSearch}
                    onRegisterClick={handleRegister}
                />

                {/* 목록 */}
                <div className="vendor-list">
                    <div className="vendor-item">리스트 아이템 예시</div>
                </div>

                {/* 페이지네이션 */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
