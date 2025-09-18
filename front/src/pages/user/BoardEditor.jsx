import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import FileUpload from "../../components/board/FileUpload.jsx";
import "../../style/board.css";
import BoardComment from "../../components/board/BoardComment.jsx";

const host = window.location.hostname || "localhost";
const API = import.meta?.env?.VITE_API_BASE_URL?.trim() || `http://${host}:8080`;

// 숫자면 그 값, 아니면 null
const toNumericId = (v) => (/^\d+$/.test(String(v)) ? Number(v) : null);

export default function BoardPage() {
    const {id} = useParams();
    const {pathname} = useLocation();
    const nav = useNavigate();

    const numericId = toNumericId(id);              // 1, 2, ... 또는 null
    const isCreate = pathname.endsWith("/new");
    const isEdit = pathname.endsWith("/edit");
    const mode = isCreate ? "create" : isEdit ? "edit" : "view";
    const readOnly = mode === "view";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState(null);

    // 상세/수정일 때만 로드(= 숫자 id가 있을 때만)
    useEffect(() => {
        if (!numericId) return;

        let abort = false;
        (async () => {
            try {
                const res = await fetch(`${API}/board/${numericId}`);
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
    }, [numericId, nav]);

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
                    typeof a === "string" ? {originalName: a, savedName: a} : a
                ),
            };

            const url = isCreate ? `${API}/board/new` : `${API}/board/${numericId}`;
            const method = isCreate ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(isCreate ? "작성 실패" : "수정 실패");

            nav(isCreate ? "/board" : `/board/${numericId}`);
        } catch (e) {
            console.error(e);
            alert(e.message || "처리 중 오류");
        } finally {
            setSubmitting(false);
        }
    };

    const goEdit = () => numericId && nav(`/board/${numericId}/edit`);
    const goList = () => nav("/board");

    return (
        <div className="be-wrap">
            <div className="be-card">
                <h2 className="be-title">
                    {mode === "create" ? "게시글 등록" : mode === "edit" ? "게시글 수정" : "게시글 상세"}
                </h2>

                {meta && mode !== "create" && (
                    <div className="be-meta">
                        <span>{meta.writerName}</span>
                        <span className="be-right">
      <span>작성: {meta.createdAt?.slice(0, 10)}</span>
                            {meta.updatedAt && <span>수정: {meta.updatedAt.slice(0, 10)}</span>}
                            <span>조회 {meta.viewCount}</span>
    </span>
                    </div>
                )}


                <form onSubmit={onSubmit} className="be-form">
                    <label className="be-label" htmlFor="title">제목</label>
                    <input id="title" className="be-input" value={title}
                           onChange={(e) => setTitle(e.target.value)} readOnly={readOnly}/>

                    <label className="be-label">이미지</label>
                    {readOnly ? (
                        <div className="be-images">
                            {(attachments ?? []).length === 0 ? (
                                <div className="be-empty">첨부 이미지가 없습니다.</div>
                            ) : (
                                <>
                                    <img
                                        className="be-mainimg"
                                        src={`${API}/board/file/${attachments[0].savedName}`}
                                        alt={attachments[0].originalName ?? "image"}
                                    />
                                    {attachments.length > 1 && (
                                        <div className="be-thumbs">
                                            {attachments.slice(1).map((f, i) => (
                                                <img
                                                    key={i}
                                                    src={`${API}/board/file/${f.savedName}`}
                                                    alt={f.originalName ?? `image-${i+2}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
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
                    <textarea id="content" className="be-textarea" rows={12}
                              value={content} onChange={(e) => setContent(e.target.value)}
                              readOnly={readOnly}/>

                    <div className="be-actions">
                        {mode === "view" ? (
                            <>
                                <button type="button" className="be-btn be-btn-primary" onClick={goEdit}>수정</button>
                                <button type="button" className="be-btn be-btn-ghost" onClick={goList}>목록</button>
                                <button type="button" className="be-btn be-btn-danger"
                                        onClick={async () => {
                                            if (window.confirm("정말 삭제하시겠습니까?")) {
                                                try {
                                                    await fetch(`${API}/board/${numericId}`, {method: "DELETE"});
                                                    alert("삭제되었습니다.");
                                                    nav("/board");
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("삭제 실패");
                                                }
                                            }
                                        }}>
                                    삭제
                                </button>
                            </>
                        ) : mode === "edit" ? (
                            <>
                                <button type="submit" className="be-btn be-btn-primary"
                                        disabled={submitting || uploading}>
                                    {submitting ? "수정 중..." : "수정하기"}
                                </button>
                                <button type="button" className="be-btn be-btn-ghost" onClick={goList}>취소</button>
                            </>
                        ) : (
                            <>
                                <button type="submit" className="be-btn be-btn-primary"
                                        disabled={submitting || uploading}>
                                    {submitting ? "작성 중..." : "등록"}
                                </button>
                                <button type="button" className="be-btn be-btn-ghost" onClick={goList}>취소</button>
                            </>
                        )}
                    </div>
                </form>
            </div>
            {mode !== "create" && numericId && (
                <div className="be-card" style={{marginTop: 16, position: 'relative', zIndex: 2}}>
                    <BoardComment boardId={numericId}/>
                </div>
            )}
        </div>
    );
}
