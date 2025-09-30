import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination as SwiperPagination, Thumbs, Keyboard, A11y, FreeMode } from "swiper/modules";
import "swiper/css";

import FileUpload from "../../components/board/FileUpload.jsx";
import BoardComment from "../../components/board/BoardComment.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DOMPurify from "dompurify";

import Button from "../../components/commons/Button.jsx";
import "../../style/boardEditor.css";

const API = import.meta.env.VITE_API_BASE_URL;

const toNumericId = (v) => (/^\d+$/.test(String(v)) ? Number(v) : null);

export default function BoardEditor() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const nav = useNavigate();

  const numericId = toNumericId(id);
  const isCreate = pathname.includes("/new");
  const isEdit = pathname.includes("/edit");
  const mode = isCreate ? "create" : isEdit ? "edit" : "view";
  const readOnly = mode === "view";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState(null);
  const hasCountedRef = useRef(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const { auth } = useAuth();
  const token = auth?.token;

  useEffect(() => {
    if (!numericId || !token) return;

    let abort = false;
    (async () => {
      try {
        const res = await fetch(`${API}/board/${numericId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("게시글 불러오기 실패");
        const dto = await res.json();
        if (abort) return;

        setTitle(dto.title ?? "");
        setContent(dto.content ?? "");
        setAttachments(dto.files ?? []);
        setMeta({
          writerName: dto.writerName,
          writerId: dto.writerId,
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
  }, [numericId, nav, token]);

  // 조회수 증가
  useEffect(() => {
    if (mode !== "view" || !numericId || !token) return;
    if (hasCountedRef.current) return;

    const key = `viewed-board-${numericId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    hasCountedRef.current = true;

    (async () => {
      try {
        const res = await fetch(`${API}/board/${numericId}/views`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) return;
        setMeta((prev) => (prev ? { ...prev, viewCount: (prev.viewCount ?? 0) + 1 } : prev));
      } catch (_) {}
    })();
  }, [mode, numericId, token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!title.trim()) return alert("제목을 입력하세요");
    if (!content.trim()) return alert("내용을 입력하세요");
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

      const url = isCreate ? `${API}/board/new` : `${API}/board/${numericId}`;
      const method = isCreate ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
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

  const goEdit = () => numericId && nav(`/board/edit/${numericId}`);
  const goList = () => nav("/board");

  const pageTitle = isCreate ? "게시글 등록" : isEdit ? "게시글 수정" : "게시글";

  return (
    <div className="boardEditContainer">
      <div className="inner">
        {readOnly ? (
          <div className="be-wrap">
            <div className="be-card">
              <form className="be-form" onSubmit={(e) => e.preventDefault()}>
                {meta && (
                  <div className="be-meta be-meta--top">
                    <div className="be-meta__left">
                      <span className="be-author">{meta.writerName}</span>
                      <span className="be-sep">·</span>
                      <span className="be-date">작성 {meta.createdAt?.slice(0, 10)}</span>
                      {meta.updatedAt && (
                        <>
                          <span className="be-sep">·</span>
                          <span className="be-date">수정 {meta.updatedAt.slice(0, 10)}</span>
                        </>
                      )}
                    </div>
                    <div className="be-meta__right">
                      <span className="be-views">조회수 {meta.viewCount ?? 0}</span>
                    </div>
                  </div>
                )}

                {/* 상단 제목, 우측 버튼 */}
                <div className="be-head">
                  <input
                    id="title"
                    className="be-title"
                    value={title}
                    readOnly
                    placeholder="제목"
                  />

                  <div className="be-head__actions">
                    {meta?.writerId === auth?.user?.login_id && (
                      <>
                        <Button variant="ghost" onClick={goEdit} aria-label="수정">
                          수정
                        </Button>
                        <Button
                          className="borderBar"
                          variant="ghost"
                          onClick={async () => {
                            if (!window.confirm("정말 삭제하시겠습니까?")) return;
                            try {
                              await fetch(`${API}/board/${numericId}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                                credentials: "include",
                              });
                              alert("삭제되었습니다.");
                              nav("/board");
                            } catch (e) {
                              console.error(e);
                              alert("삭제 실패");
                            }
                          }}
                          aria-label="삭제"
                        >
                          삭제
                        </Button>
                      </>
                    )}

                    <Button variant="ghost" onClick={goList} aria-label="목록">
                      목록
                    </Button>
                  </div>
                </div>

                {/* 이미지 */}
                {attachments.length > 0 && (
                  <>
                    <div className="be-swiper">
                      <Swiper
                        className="be-swiper__main"
                        modules={[Navigation, SwiperPagination, Thumbs, Keyboard, A11y]}
                        navigation
                        pagination={{ clickable: true }}
                        keyboard={{ enabled: true }}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        loop={false}
                        a11y={{ enabled: true }}
                        spaceBetween={12}
                        slidesPerView={1}
                        breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 12 } }}
                        observer
                        observeParents
                        watchSlidesProgress
                      >
                        {attachments.map((f) => (
                          <SwiperSlide key={f.savedName || f.url}>
                            <img
                              className="be-mainimg"
                              src={`${API}${f.url}`}
                              alt={f.originalName || "image"}
                              loading="lazy"
                              draggable="false"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {attachments.length > 1 && (
                        <Swiper
                          className="be-swiper__thumbs"
                          onSwiper={setThumbsSwiper}
                          modules={[FreeMode, Thumbs]}
                          slidesPerView="auto"
                          spaceBetween={8}
                          freeMode
                          watchSlidesProgress
                          loop={false}
                          slideToClickedSlide
                          observer
                          observeParents
                        >
                          {attachments.map((f) => (
                            <SwiperSlide key={`thumb-${f.savedName || f.url}`} className="be-swiper__thumb">
                              <img
                                src={`${API}${f.url}`}
                                alt={f.originalName || "thumb"}
                                loading="lazy"
                                draggable="false"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      )}
                    </div>
                  </>
                )}

                {/* 본문 */}
                  {/* 본문 */}
                  <div
                      className="be-content ck-content"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || "") }}
                  />
              </form>
            </div>

            {/* 댓글 */}
            {numericId && (
              <div className="be-card" style={{ marginTop: 16, position: "relative", zIndex: 2 }}>
                <BoardComment boardId={numericId} />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="be-formCard">
            <h1 className="be-formCard__title">{pageTitle}</h1>

            {/* 제목 */}
            <div className="be-field">
              <label htmlFor="be-title" className="be-field__label required">
                제목
              </label>
              <input
                id="be-title"
                className="be-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>

            {/* 이미지 업로드 */}
            <div className="be-field">
              <label className="be-field__label">이미지</label>
              <FileUpload
                value={attachments}
                onChange={setAttachments}
                accept="image/*"
                multiple
                onUploadingChange={setUploading}
              />
            </div>

            {/* 내용 */}
            <div className="be-field">
              <label className="be-field__label required">내용</label>
              <div className="be-ck be-ck--article">
                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  disabled={false}
                  config={{
                    placeholder: "내용을 입력하세요",
                    toolbar: [
                      "heading", "|",
                      "bold", "italic", "|",
                      "undo", "redo"
                    ],
                  }}
                  onChange={(e, editor) => setContent(editor.getData())}
                />
              </div>
            </div>

            <div className="be-formCard__actions">
              <Button type="submit" variant="primary" color="red" disabled={submitting || uploading}>
                {isEdit ? (submitting ? "수정 중..." : "수정") : (submitting ? "작성 중..." : "등록")}
              </Button>
              <Button type="button" variant="outline" color="gray" onClick={goList}>
                취소
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
