import React, {
  memo, useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../commons/Button.jsx";
import Pagination from "../commons/Pagination.jsx";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DOMPurify from "dompurify";

const host = window.location.hostname || "localhost";
const API = import.meta?.env?.VITE_API_BASE_URL?.trim() || `http://${host}:8080`;

function BoardComment({ boardId }) {
  const { auth } = useAuth();
  const token = auth?.token;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  // CKEditor
  const [rootHtml, setRootHtml] = useState("");
  const rootEditorRef = useRef(null);

  // 열려있는 답글 폼
  const [replyingId, setReplyingId] = useState(null);
  const replyEditorRef = useRef(null);
  const replySubmitRef = useRef(null);

  // 루트 댓글별 대댓글 보기/숨기기 토글 상태
  const [openThreads, setOpenThreads] = useState(() => new Set());

  // 페이지네이션 상태
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const normalize = (dto) => {
    const rawPid = dto.parentId ?? dto.parent_id ?? dto.parent;
    const parentId =
      rawPid === undefined || rawPid === null || rawPid === "" || rawPid === 0 || rawPid === "0"
        ? null
        : String(rawPid);
    return {
      commentId: String(dto.commentId ?? dto.id),
      parentId,
      writerId: dto.writerId,
      writerName: dto.writerName ?? dto.authorName ?? "",
      content: dto.content ?? "",
      createdAt: dto.createdAt ?? "",
    };
  };

  const fetchComments = useCallback(async () => {
    if (!boardId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/board/${boardId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("댓글 불러오기 실패");
      const list = await res.json();
      setItems(Array.isArray(list) ? list.map(normalize) : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [boardId, token]);

  useEffect(() => {
    fetchComments();
    setReplyingId(null);
    setOpenThreads(new Set());
    setCurrentPage(1);
  }, [boardId, fetchComments, token]);

  const { roots, childrenByParent } = useMemo(() => {
    const byParent = new Map();
    const roots = [];
    for (const c of items) {
      if (!c.parentId) roots.push(c);
      const key = c.parentId || null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key).push(c);
    }
    for (const [key, arr] of byParent.entries()) {
      if (key === null) {
          arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      } else {
      arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      }
    }
    return { roots, childrenByParent: byParent };
  }, [items]);

  // 댓글 페이지네이션
  const totalPages = Math.max(1, Math.ceil(roots.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageSlice = roots.slice(pageStart, pageStart + PAGE_SIZE);

  const isEmptyHtml = (html) => {
    const text = DOMPurify.sanitize(html || "", { ALLOWED_TAGS: [] })
      .replace(/&nbsp;/g, " ")
      .trim();
    return text.length === 0;
  };

  const postComment = useCallback(
    async ({ content, parentId = null }) => {
      const body = parentId ? { content, parentId } : { content };
      const res = await fetch(`${API}/board/${boardId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("등록 실패");
      try {
        const created = await res.json();
        if (created && (created.commentId ?? created.id)) {
          const nc = normalize(created);
          setItems((prev) => {
            const next = [nc, ...prev];
           if (!nc.parentId) {
               setCurrentPage(1);
           } else {
               setOpenThreads((prevOpen) => {
               const s = new Set(prevOpen);
               s.add(String(nc.parentId));
               return s;
          });
        }
              return next;
         });
          return ;
        }
     } catch (_) {}
      await fetchComments();
    },
    [boardId, token, fetchComments]
  );

  const onSubmitRoot = useCallback(async () => {
    if (posting) return;
    if (isEmptyHtml(rootHtml)) return;
    setPosting(true);
    try {
      await postComment({ content: rootHtml, parentId: null });
      setRootHtml("");
      rootEditorRef.current?.editing?.view?.focus();
    } catch (e) {
      console.error(e);
      alert(e.message || "댓글 등록 실패");
    } finally {
      setPosting(false);
    }
  }, [posting, rootHtml, postComment]);

  const onDelete = useCallback(
    async (commentId) => {
      if (!window.confirm("이 댓글을 삭제할까요?")) return;
      const backup = items;
      setItems((prev) => prev.filter((c) => c.commentId !== commentId));
      try {
        const res = await fetch(`${API}/board/${boardId}/comments/${commentId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error("삭제 실패");
      } catch (e) {
        console.error(e);
        alert("삭제에 실패했습니다.");
        setItems(backup);
      }
    },
    [items, boardId, token]
  );

  const toggleReplyForm = useCallback((commentId, depth) => {
    if (depth > 0) return;
    setReplyingId((cur) => (cur === commentId ? null : commentId));
  }, []);

  // 루트별 대댓글 토글
  const toggleThread = useCallback((rootId) => {
    setOpenThreads((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) {
        next.delete(rootId);
        setReplyingId((cur) => (cur === rootId ? null : cur)); // 닫을 때 답글 폼도 닫기
      } else {
        next.add(rootId);
      }
      return next;
    });
  }, []);

  const isThreadOpen = useCallback((rootId) => openThreads.has(rootId), [openThreads]);

  return (
    <div className="be-comments">
      <div className="be-comments-head">
        <h3 className="be-comments-title">댓글</h3>
        <Button
          type="button"
          variant="ghost"
          color="red"
          onClick={onSubmitRoot}
          disabled={posting}
          aria-label="댓글 등록"
        >
          {posting ? "등록 중..." : "등록"}
        </Button>
      </div>

      <form className="be-comment-form" onSubmit={(e)=>{e.preventDefault();}}>
        <div className="be-ck be-ck--compact" style={{gridColumn:'1 / -1'}}>
          <CKEditor
            editor={ClassicEditor}
            data={rootHtml}
            onReady={(editor) => { rootEditorRef.current = editor; }}
            onChange={(_, editor) => setRootHtml(editor.getData())}
            disabled={posting}
            config={{ toolbar: [], placeholder: "댓글을 남겨보세요" }}
          />
        </div>
      </form>

      {loading ? (
        <div className="be-empty">불러오는 중…</div>
      ) : (
        <>
          <ul className="be-comment-list">
            {roots.length === 0 ? (
              <div className="be-empty">첫 댓글을 남겨보세요.</div>
            ) : (
              pageSlice.map((c) => (
                <MemoCommentNode
                  key={c.commentId}
                  c={c}
                  depth={0}
                  maxDepth={1}
                  childrenByParent={childrenByParent}
                  replyingId={replyingId}
                  onToggleReply={toggleReplyForm}
                  onDelete={onDelete}
                  posting={posting}
                  postComment={postComment}
                  setReplyingId={setReplyingId}
                  replyEditorRef={replyEditorRef}
                  replySubmitRef={replySubmitRef}
                  token={token}
                  auth={auth}

                  isOpen={isThreadOpen(c.commentId)}
                  onToggleThread={() => toggleThread(c.commentId)}
                />
              ))
            )}
          </ul>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{marginTop: 8, display:"flex", justifyContent:"center"}}>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ReplyInlineForm = ({
  parentId,
  posting,
  postComment,
  onClose,
  replyEditorRef,
  replySubmitRef,
}) => {
  const [html, setHtml] = useState("");

  const isEmptyHtml = (h) => {
    const text = DOMPurify.sanitize(h || "", { ALLOWED_TAGS: [] })
      .replace(/&nbsp;/g, " ")
      .trim();
    return text.length === 0;
  };

  const onSubmitReply = useCallback(
    async (e) => {
      e.preventDefault();
      if (posting) return;
      if (isEmptyHtml(html)) return;
      try {
        await postComment({ content: html, parentId });
        setHtml("");
        onClose();
      } catch (e) {
        console.error(e);
        alert(e.message || "답글 등록 실패");
      }
    },
    [posting, html, parentId, postComment, onClose]
  );

  return (
    <form className="be-reply-form" onSubmit={onSubmitReply}>
      <div className="be-ck be-ck--compact">
        <CKEditor
          editor={ClassicEditor}
          data={html}
          onReady={(editor) => {
            replyEditorRef.current = editor;
            setTimeout(() => editor.editing.view.focus(), 0);
          }}
          onChange={(_, editor) => setHtml(editor.getData())}
          disabled={posting}
          config={{ toolbar: [], placeholder: "답글을 남겨보세요" }}
        />
      </div>
      <button type="submit" ref={replySubmitRef} style={{ display: "none" }} />
    </form>
  );
};

const CommentNode = ({
  c, depth, maxDepth = 1, childrenByParent, replyingId,
  onToggleReply, onDelete, posting, postComment, setReplyingId,
  replyEditorRef, replySubmitRef, token, auth,
  isOpen = false, onToggleThread,
}) => {
  const children = childrenByParent.get(c.commentId) || [];
  const isReplyingHere = replyingId === c.commentId;
  const allowReplyHere = depth === 0;

  return (
    <li className={`be-comment-item ${depth > 0 ? "is-reply" : ""}`} data-depth={depth}>
      <div className="be-comment-meta">
        <div className="be-meta-left">
          <span className="be-comment-author">{c.writerName}</span>
          <span className="be-comment-date">
            {String(c.createdAt ?? "").slice(0, 16).replace("T", " ")}
          </span>
        </div>
        <div className="be-meta-right">
          {token && c.writerId === auth?.user?.login_id && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onDelete(c.commentId)}
              aria-label="댓글 삭제"
            >
              삭제
            </Button>
          )}
        </div>
      </div>

      <div
        className="be-comment-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.content || "") }}
      />

      <div className="be-comment-ops" style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:'8px'}}>
        <div className="be-ops-left">
          {allowReplyHere && (
            <>
              <Button
                type="button"
                variant="ghost"
                color="gray"
                onClick={() => onToggleReply(c.commentId, depth)}
                aria-label="답글쓰기"
              >
                답글쓰기{(children?.length ?? 0) > 0 ? ` (${children.length})` : ""}
              </Button>

              {children.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  color="gray"
                  onClick={onToggleThread}
                  aria-label="대댓글 토글"
                  aria-expanded={isOpen}
                  className="btn-caret"
                >
                  {isOpen ? "댓글 숨기기" : "댓글 보기"}{" "}
                  <span className="caret" aria-hidden="true" />
                </Button>
              )}
            </>
          )}
        </div>

        <div className="be-ops-right" style={{display:'inline-flex', gap:6}}>
          {isReplyingHere && (
            <>
              <Button
                type="button"
                variant="ghost"
                color="red"
                onClick={() => setReplyingId(null)}
                aria-label="답글 취소"
              >
                취소
              </Button>
              <Button
                type="button"
                variant="ghost"
                color="red"
                onClick={() => replySubmitRef.current?.click()}
                aria-label="답글 등록"
                disabled={posting}
              >
                {posting ? "등록 중..." : "등록"}
              </Button>
            </>
          )}
        </div>
      </div>

      {allowReplyHere && children.length > 0 && isOpen && (
        <ul className="be-comment-children">
          {children.map((cc) => (
            <MemoCommentNode
              key={cc.commentId}
              c={cc}
              depth={depth + 1}
              maxDepth={maxDepth}
              childrenByParent={childrenByParent}
              replyingId={replyingId}
              onToggleReply={onToggleReply}
              onDelete={onDelete}
              posting={posting}
              postComment={postComment}
              setReplyingId={setReplyingId}
              replyEditorRef={replyEditorRef}
              replySubmitRef={replySubmitRef}
              token={token}
              auth={auth}
            />
          ))}
        </ul>
      )}

      {isReplyingHere && allowReplyHere && (
        <ReplyInlineForm
          parentId={c.commentId}
          posting={posting}
          postComment={postComment}
          onClose={() => setReplyingId(null)}
          replyEditorRef={replyEditorRef}
          replySubmitRef={replySubmitRef}
        />
      )}
    </li>
  );
};

const MemoCommentNode = memo(CommentNode);
export default BoardComment;
