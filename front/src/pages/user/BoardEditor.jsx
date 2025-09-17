import {useState} from "react";
import "../../style/BoardEditor.css";
import FileUpload from "../../components/board/FileUpload.jsx";

export default function BoardEditor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const API = "http://localhost:8080";

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return alert("제목을 입력하세요");
        if (uploading) return alert("파일 업로드가 끝날 때까지 기다려주세요.");

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/board/new`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title,
                    content,
                    files: (attachments ?? []).map(a =>
                        typeof a === "string"
                            ? {originalName: a, savedName: a}
                            : a
                    ),
                }),
            });
            if (!res.ok) throw new Error("작성 실패");
            window.location.href = "/board";
        } catch (e) {
            alert(e.message || "작성 오류");
        } finally {
            setSubmitting(false);
        }
    };

    const onCancel = () => window.history.back();

    return (
        <div className="be-wrap">
            <div className="be-card">
                <h2 className="be-title">게시글 등록</h2>

                <form onSubmit={onSubmit} className="be-form">
                    <label className="be-label" htmlFor="title">제목</label>
                    <input
                        id="title"
                        className="be-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <label className="be-label">이미지</label>
                    <FileUpload
                        value={attachments}
                        onChange={setAttachments}
                        accept="image/*"
                        multiple
                        onUploadingChange={setUploading}
                    />

                    <label className="be-label" htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        className="be-textarea"
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div className="be-actions">
                        <button
                            type="submit"
                            className="be-btn be-btn-primary"
                            disabled={submitting || uploading}
                        >
                            {submitting ? "작성 중..." : "등록"}
                        </button>
                        <button type="button" className="be-btn be-btn-ghost" onClick={onCancel}>
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
