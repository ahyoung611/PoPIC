import React, { useEffect, useState } from "react";
import SearchHeader from "../../components/commons/SearchHeader";
import Pagination from "../../components/commons/Pagination";
import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import ConfirmModal from "../../components/commons/ConfirmModal.jsx";

export default function VendorMain() {
    const [searchValue, setSearchValue] = useState("");
    const [sort, setSort] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 5;

    const handleSearch = () => {
        console.log("검색 실행:", { searchValue, sort });
    };

    const handleRegister = () => {
        console.log("등록 버튼 클릭");
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, sort]);

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("반려하시겠습니까?");

    const handleReject = () => {
        // TODO: 반려 처리(API 등)
        setOpen(false);
    };

    return (
        <div className="container">
            <div className="inner">
                <Button variant="outline" className="rounded-xl" onClick={() => setOpen(true)}>
                    반려
                </Button>

                <ConfirmModal
                    open={open}
                    title="확인하시겠습니까?" // 타이틀 변경
                    okText="네"
                    cancelText="아니오"
                    danger
                    onConfirm={handleReject}
                    onCancel={() => setOpen(false)}
                />

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
