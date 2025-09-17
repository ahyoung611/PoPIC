import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FileUpload from "../../components/board/FileUpload.jsx";
import "../../style/board.css";

const API =
    import.meta?.env?.VITE_API_BASE_URL ||
    `http://${window.location.hostname}:8080`;

export default function BoardPage() {
    const { id } = useParams();
    const { pathname } = useLocation();
    const nav = useNavigate();

    const mode = useMemo(() => {
        if (!id) return "create";
        return pathname.endsWith("/edit") ? "edit" : "view";
    }, [id, pathname]);

    const readOnly = mode === "view";

    // 폼 상태
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]); // {originalName,savedName}[]
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState(null); // 작성자, 날짜, 조회수 등

    // 상세/수정일 때 데이터 로드
    useEffect(() => {
        if (!id) return;
        let abort = false;

        (async () => {
            try {
                const res = await fetch(`${API}/board/${id}`);
                if (!res.ok) throw new Error("게시글 불러오기 실패");
                const dto = await res.json();

                if (abort) return;

                setTitle(dto.title ?? "");
                setContent(dto.content ?? "");
                setAttachments(dto.files ?? []);
                setMeta({
                    writerName: dto.writerName,
                    createdAt: dto.createdAt,
                    updatedAt: dto.updatedAt,
                    viewCount: dto.viewCount,
                });
            } catch (e) {
                console.error(e);
                alert("게시글을 불러오지 못했습니다.");
                nav("/board");
            }
        })();

        return () => {
            abort = true;
        };
    }, [id, nav]);

    // 저장/수정 제출
    const onSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;
        if (!title.trim()) return alert("제목을 입력하세요");
        if (uploading) return alert("파일 업로드가 끝날 때까지 기다려주세요.");

        setSubmitting(true);
        try {
            const payload = {
                title,
                content,
                files: (attachments ?? []).map((a) =>
                    typeof a === "string" ? { originalName: a, savedName: a } : a
                ),
            };

            const url =
                mode === "create" ? `${API}/board/new` : `${API}/board/${id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(mode === "create" ? "작성 실패" : "수정 실패");

            if (mode === "create") {
                nav("/board");
            } else {
                nav(`/board/${id}`);
            }
        } catch (e) {
            console.error(e);
            alert(e.message || "처리 중 오류");
        } finally {
            setSubmitting(false);
        }
    };

    const goEdit = () => nav(`/board/${id}/edit`);
    const goList = () => nav("/board");

    return (
        <div className="be-wrap">
            <div className="be-card">
                <h2 className="be-title">
                    {mode === "create" ? "게시글 등록" : mode === "edit" ? "게시글 수정" : "게시글 상세"}
                </h2>

                {meta && (
                    <div className="be-meta" aria-hidden={mode === "create"}>
                        <span>{meta.writerName}</span>
                        <span>작성: {meta.createdAt?.slice(0, 10)}</span>
                        {meta.updatedAt && <span>수정: {meta.updatedAt?.slice(0, 10)}</span>}
                        <span>조회 {meta.viewCount}</span>
                    </div>
                )}

                <form onSubmit={onSubmit} className="be-form">
                    <label className="be-label" htmlFor="title">제목</label>
                    <input
                        id="title"
                        className="be-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        readOnly={readOnly}
                    />

                    <label className="be-label">이미지</label>
                    {readOnly ? (
                        <div className="be-images">
                            {(attachments ?? []).length === 0 ? (
                                <div className="be-empty">첨부 이미지가 없습니다.</div>
                            ) : (
                                <div className="be-thumbs">
                                    {attachments.map((f, i) => (
                                        <img
                                            key={i}
                                            src={`/files/${f.savedName ?? f}`} // 프로젝트 경로 맞게 조정
                                            alt={f.originalName ?? "image"}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <FileUpload
                            value={attachments}
                            onChange={setAttachments}
                            accept="image/*"
                            multiple
                            onUploadingChange={setUploading}
                        />
                    )}

                    <label className="be-label" htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        className="be-textarea"
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        readOnly={readOnly}
                    />

                    <div className="be-actions">
                        {mode === "view" ? (
                            <>
                                <button type="button" className="be-btn be-btn-primary" onClick={goEdit}>
                                    수정
                                </button>
                                <button type="button" className="be-btn be-btn-ghost" onClick={goList}>
                                    목록
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    className="be-btn be-btn-primary"
                                    disabled={submitting || uploading}
                                >
                                    {mode === "create" ? (submitting ? "작성 중..." : "등록") : (submitting ? "수정 중..." : "수정")}
                                </button>
                                <button type="button" className="be-btn be-btn-ghost" onClick={goList}>
                                    취소
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
