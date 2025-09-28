import React from "react";
import "../../style/modal.css";
import Button from "./Button.jsx"; // 주신 CSS 파일 import (파일명 변경 가능)

export default function InquiryModal({
                                        open,            // 모달 열림 여부
                                        title,           // 모달 제목
                                        subject,         // 제목 입력값
                                        onSubjectChange, // 제목 변경 핸들러
                                        content,         // 내용 입력값
                                        onContentChange, // 내용 변경 핸들러
                                        onSubmit,        // 제출 버튼 클릭 시 실행
                                        onClose,         // 취소 버튼 클릭 시 실행
                                        submitText = "문의 완료", // 확인 버튼 텍스트
                                        cancelText = "취소",      // 취소 버튼 텍스트
                                        privateChecked,
                                        onPrivateChange,
                                        editData
                                     }) {
    if (!open) return null;

    return (
        <div className="modalMask">
            <div className="modalPanel">
                {/* 타이틀 */}
                <h2 className="modalTitle">{title}</h2>

                {/* 제목 입력 */}
                <input
                    type="text"
                    placeholder="제목을 입력해주세요."
                    value={subject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                />

                {/* 내용 입력 */}
                <textarea
                    placeholder="내용을 입력해주세요."
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    style={{
                        width: "100%",
                        minHeight: "140px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        resize: "none",
                        marginBottom: "20px",
                    }}
                />

                {/* 비공개 체크 */}
                <div className="privateCheck">
                    <input type="checkbox" id="private"
                           checked={privateChecked}
                           onChange={(e) => onPrivateChange(e.target.checked)}
                    />
                    <label htmlFor="private">
                        비공개
                    </label>
                </div>

                {/* 버튼 영역 */}
                <div className="modalActions">
                    <Button className="modalBtn" variant="primary" color="red" onClick={onSubmit}>{submitText}</Button>
                    <Button className="modalBtn" variant="cancel" color="gray" onClick={onClose}> {cancelText}</Button>
                </div>
            </div>
        </div>
    );
}
