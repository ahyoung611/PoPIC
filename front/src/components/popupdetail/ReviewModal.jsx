import { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Button from "../commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ReviewModal({ isOpen, onClose, popupId, onSubmitSuccess, editData }) {
  const { getToken, getUser } = useAuth();
  const token = getToken();
  const user = getUser();

  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setTitle(editData.title ?? "");
      setHtml(editData.content ?? "");
      setExistingImage(editData.images?.[0] ?? null);
      setFile(null);
    } else {
      setTitle("");
      setHtml("");
      setExistingImage(null);
      setFile(null);
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!title.trim()) {
      alert("리뷰 제목을 입력하세요.");
      return;
    }
    const plain = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!plain) {
      alert("리뷰 내용을 입력하세요.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", html);
    fd.append("popupId", popupId);
    fd.append("userId", user.user_id);
    fd.append("type", "review");

    if (file) {
      fd.append("file", file);
    } else if (existingImage) {
      fd.append("existingImage", existingImage);
    } else {
      fd.append("existingImage", "");
    }

    try {
      setSaving(true);
      await apiRequest(
        editData ? `/popupStore/popupReview/modify/${editData.review_id}` : `/popupStore/popupReview`,
        { method: "POST", body: fd },
        token
      );

      alert(editData ? "리뷰가 수정되었습니다." : "리뷰가 등록되었습니다.");
      onSubmitSuccess?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(e?.message || "리뷰 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modalMask reviewModal">
      <div className="modalPanel">
        <h2 className="modalTitle">{editData ? "리뷰 수정" : "리뷰 작성"}</h2>

        <div className="modalForm">
          {/* 제목 */}
          <div className="modalField">
            <label className="modalLabel" htmlFor="review-title">제목</label>
            <input
              id="review-title"
              type="text"
              className="modalInput"
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 내용 */}
          <div className="modalField">
            <label className="modalLabel" htmlFor="review-content">내용</label>
            <div className="modalCK be-ck be-ck--article" id="review-content">
              <CKEditor
                editor={ClassicEditor}
                data={html}
                onReady={(ed) => { editorRef.current = ed; }}
                onChange={(_, ed) => setHtml(ed.getData())}
                disabled={saving}
                config={{
                  toolbar: [],
                  placeholder: "내용을 입력해주세요.",
                }}
              />
            </div>
          </div>

          {/* 기존 이미지 */}
          {existingImage && !file && (
            <div className="modalField existing-image-preview">
              <div className="thumb" role="img"
                   style={{
                     backgroundImage: `url('http://localhost:8080/images?type=review&id=${existingImage}')`
                   }}
              />
              <button type="button" className="btn-text" onClick={() => setExistingImage(null)}>
                이미지 제거
              </button>
            </div>
          )}

          {/* 파일 업로드 */}
          <div className="modalField">
            <label className="modalLabel">이미지</label>
            <div className="fileRow">
              <input
                id="review-file"
                type="file"
                accept="image/*"
                className="fileInput-hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="review-file" className="fileBtn">파일 선택</label>
              <span className="fileName">
                {file?.name || (existingImage ? "기존 이미지 유지" : "선택된 파일 없음")}
              </span>
            </div>
          </div>
        </div>

        <div className="modalActions">
          <Button className="modalBtn" variant="primary" color="red" onClick={handleSubmit} disabled={saving}>
            {saving ? "처리 중..." : (editData ? "수정" : "등록")}
          </Button>
          <Button className="modalBtn" variant="outline" color="gray" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
