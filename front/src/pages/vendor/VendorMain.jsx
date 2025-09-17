import React, { useState } from "react";
import SearchHeader from "../../components/commons/SearchHeader"; // 검색 + 등록 버튼
import Pagination from "../../components/commons/Pagination";
import InquiryModal from "../../components/commons/InquiryModal.jsx";     // 페이지네이션

export default function VendorMain() {
    // 상태 관리
    const [searchValue, setSearchValue] = useState(""); // 검색어
    const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지
    const totalPages = 5;                               // 총 페이지 수

    // 검색 실행
    const handleSearch = () => {
        console.log("검색 실행:", { searchValue, sort });
        // TODO: API 호출 or 리스트 필터링
    };

    // 등록 버튼 클릭 시
    const handleRegister = () => {
        console.log("등록 버튼 클릭");
        // TODO: 등록 페이지 이동 (ex: navigate("/vendor/popups/edit"))
    };

    // 문의하기 모달
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("") // 제목 상태 관리
    const [content, setContent] = useState("") // 내용 상태 관리

    const handleSubmit= ()=>{
        console.log("문의 전송:" ,{subject,content});
        setOpen(false);
    }

    return (
        <div className="container">
            <div className="inner">

                <button onClick={() => setOpen(true)}>문의하기 열기</button>

                <InquiryModal
                    open={open}
                    title="문의하기"
                    subject={subject}
                    onSubjectChange={setSubject}
                    content={content}
                    onContentChange={setContent}
                    onSubmit={handleSubmit}
                    onClose={() => setOpen(false)}
                    submitText="문의 완료"
                    cancelText="취소"
                />

                {/* 검색 + 등록 (공통 컴포넌트) */}
                <SearchHeader
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    onSearchClick={handleSearch}
                    onRegisterClick={handleRegister}
                />

                {/* 리스트 영역 */}
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
