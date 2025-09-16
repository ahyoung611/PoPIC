import { useRef, useState } from "react";
import "../../style/BoardEditor.css";

function FileUpload({ value = [], onChange }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const pickFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploading(true);
        try {
            const fd = new FormData();
            files.forEach((f) => fd.append("files", f));
            const res = await fetch("/board/uploadAjax", { method: "POST", body: fd });
            if (!res.ok) throw new Error("업로드 실패");

            const serverNames = await res.json(); // ["server/path/a.png", ...]
            onChange?.([...(value || []), ...serverNames]);

            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const removeServerFile = async (fileName) => {
        try {
            const res = await fetch("/board/deleteFile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName }),
            });
            if (!res.ok) throw new Error("삭제 실패");
            onChange?.((value || []).filter((f) => f !== fileName));
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="be-upload">
            <div className="be-file-row">
                <input
                    ref={inputRef}
                    id="image"
                    className="be-file-input"
                    type="file"
                    name="files"
                    multiple
                    accept="image/*"
                    onChange={pickFiles}
                    disabled={uploading}
                />
                <label htmlFor="image" className="be-file-btn">
                    {uploading ? "업로드 중..." : "파일 ++"}
                </label>
            </div>

            {!!(value && value.length) && (
                <ul className="be-file-list">
                    {value.map((name) => (
                        <li key={name} className="be-file-item">
                            <span className="be-file-name" title={name}>{name}</span>
                            <button
                                type="button"
                                className="be-chip-remove"
                                onClick={() => removeServerFile(name)}
                            >
                                삭제
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function BoardEditor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return alert("제목을 입력하세요");
        setSubmitting(true);
        try {
            const res = await fetch("/board", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, attachments }),
            });
            if (!res.ok) throw new Error("작성 실패");
            window.location.href = "/board";
        } catch (e) {
            alert(e.message);
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
                    {/* 제목 */}
                    <label className="be-label" htmlFor="title">제목</label>
                    <input
                        id="title"
                        className="be-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* 이미지 */}
                    <label className="be-label">이미지</label>
                    <FileUpload value={attachments} onChange={setAttachments} />

                    {/* 내용 */}
                    <label className="be-label" htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        className="be-textarea"
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* 버튼 */}
                    <div className="be-actions">
                        <button type="submit" className="be-btn be-btn-primary" disabled={submitting}>
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
