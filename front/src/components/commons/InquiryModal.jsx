import React, { useRef } from "react";
import "../../style/modal.css";
import Button from "./Button.jsx";

/* CKEditor */
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function InquiryModal({
  open,
  title,
  subject,
  onSubjectChange,
  content,            // HTML 문자열
  onContentChange,    // (htmlString) => void
  onSubmit,
  onClose,
  submitText = "문의 완료",
  cancelText = "취소",
  privateChecked,
  onPrivateChange,
}) {
  const editorRef = useRef(null);

  if (!open) return null;

  return (
    <div className="modalMask">
      <div className="modalPanel">
        {/* 타이틀 */}
        <h2 className="modalTitle">{title}</h2>

        {/* 제목 */}
        <input
          type="text"
          className="mf-input"
          placeholder="제목을 입력해주세요."
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />

        {/* 내용 (CKEditor / 툴바 없음) */}
        <div className="be-ck be-ck--article">
          <CKEditor
            editor={ClassicEditor}
            data={content || ""}
            onReady={(ed) => { editorRef.current = ed; }}
            onChange={(_, ed) => onContentChange(ed.getData())}
            config={{
              toolbar: [], // ← 툴바 제거
              placeholder: "내용을 입력해주세요.",
            }}
          />
        </div>

        {/* 비공개 체크 */}
        <div className="privateCheck" style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            id="private"
            checked={!!privateChecked}
            onChange={(e) => onPrivateChange(e.target.checked)}
          />
          <label htmlFor="private">비공개</label>
        </div>

        {/* 버튼 */}
        <div className="modalActions">
          <Button className="modalBtn" variant="primary" color="red" onClick={onSubmit}>
            {submitText}
          </Button>
          <Button className="modalBtn" variant="cancel" color="gray" onClick={onClose}>
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}
