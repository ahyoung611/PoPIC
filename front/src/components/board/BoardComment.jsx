import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";

const host = window.location.hostname || "localhost";
const API = import.meta?.env?.VITE_API_BASE_URL?.trim() || `http://${host}:8080`;

function BoardComment({boardId}) {
    const token = useAuth().getToken();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    const [rootValue, setRootValue] = useState("");
    const rootInputRef = useRef(null);

    // 어느 댓글 밑에 답글 폼이 열려있는지 (루트만 허용)
    const [replyingId, setReplyingId] = useState(null);
    const replyInputRef = useRef(null);

    const normalize = (dto) => {
        const rawPid = dto.parentId ?? dto.parent_id ?? dto.parent; // 혹시 키가 다를 수도 있어서 보수적으로
        const parentId =
            rawPid === undefined || rawPid === null || rawPid === "" || rawPid === 0 || rawPid === "0"
                ? null
                : String(rawPid);
        return {
            commentId: String(dto.commentId ?? dto.id),
            parentId,
            writerName: dto.writerName ?? dto.authorName ?? "",
            content: dto.content ?? "",
            createdAt: dto.createdAt ?? "",
        };
    };

    const fetchComments = useCallback(async () => {
        if (!boardId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/board/${boardId}/comments`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
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
    }, [boardId, fetchComments]);

    const {roots, childrenByParent} = useMemo(() => {
        const byParent = new Map();
        const roots = [];
        for (const c of items) {
            if (!c.parentId) roots.push(c);
            const key = c.parentId || null;
            if (!byParent.has(key)) byParent.set(key, []);
            byParent.get(key).push(c);
        }
        // 정렬: 루트(null 키)는 기존(작성순) 유지, 자식(비-null 키)은 최신 먼저
        for (const [key, arr] of byParent.entries()) {
            if (key === null) {
                arr.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)); // 기존
            } else {
                arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)); // 자식: 최신 위
            }
        }
        return {roots, childrenByParent: byParent};
    }, [items]);

    const postComment = useCallback(
        async ({content, parentId = null}) => {
            const body = parentId ? {content, parentId} : {content};
            const res = await fetch(`${API}/board/${boardId}/comments`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`,},
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("등록 실패");
            // 응답이 있으면 즉시 반영, 없으면 재조회
            try {
                const created = await res.json();
                if (created && (created.commentId ?? created.id)) {
                    const nc = normalize(created);
                    setItems((prev) => [...prev, nc]);
                    return;
                }
            } catch (_) {
            }
            await fetchComments();
        },
        [boardId, token, fetchComments]
    );

    const onSubmitRoot = useCallback(
        async (e) => {
            e.preventDefault();
            if (posting) return;
            const content = rootValue.trim();
            if (!content) return;
            setPosting(true);
            try {
                await postComment({content, parentId: null});
                setRootValue("");
                rootInputRef.current?.focus();
            } catch (e) {
                console.error(e);
                alert(e.message || "댓글 등록 실패");
            } finally {
                setPosting(false);
            }
        },
        [posting, rootValue, postComment]
    );

    // 삭제(해당 ID만 제거)
    const onDelete = useCallback(
        async (commentId) => {
            if (!window.confirm("이 댓글을 삭제할까요?")) return;
            const backup = items;
            setItems((prev) => prev.filter((c) => c.commentId !== commentId));
            try {
                const res = await fetch(`${API}/board/${boardId}/comments/${commentId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
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

    const toggleReplyForm = useCallback(
        (commentId, depth) => {
            if (depth > 0) return; // 대댓글 금지
            setReplyingId((cur) => (cur === commentId ? null : commentId));
            setTimeout(() => replyInputRef.current?.focus(), 0);
        },
        []
    );

    return (
        <div className="be-comments">
            <h3 className="be-comments-title">댓글</h3>

            <form className="be-comment-form" onSubmit={onSubmitRoot}>
                <input
                    ref={rootInputRef}
                    className="be-input be-comment-input"
                    placeholder="댓글을 남겨보세요"
                    value={rootValue}
                    onChange={(e) => setRootValue(e.target.value)}
                    disabled={posting}
                />
                <button className="be-btn be-btn-primary" disabled={posting}>
                    {posting ? "등록 중..." : "등록"}
                </button>
            </form>

            {loading ? (
                <div className="be-empty">불러오는 중…</div>
            ) : (
                <ul className="be-comment-list">
                    {roots.length === 0 ? (
                        <div className="be-empty">첫 댓글을 남겨보세요.</div>
                    ) : (
                        roots.map((c) => (
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
                                replyInputRef={replyInputRef}
                            />
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

const ReplyInlineForm = ({parentId, posting, postComment, onClose, inputRef}) => {
    const [value, setValue] = useState("");

    const onSubmitReply = useCallback(
        async (e) => {
            e.preventDefault();
            if (posting) return;
            const content = value.trim();
            if (!content) return;
            try {
                await postComment({content, parentId});
                setValue("");
                onClose();
            } catch (e) {
                console.error(e);
                alert(e.message || "답글 등록 실패");
            }
        },
        [posting, value, parentId, postComment, onClose]
    );

    return (
        <form className="be-reply-form" onSubmit={onSubmitReply}>
            <input
                ref={inputRef}
                className="be-input be-comment-input"
                placeholder="답글을 남겨보세요"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={posting}
            />
            <div className="be-reply-actions">
                <button type="button" className="be-btn be-btn-ghost" onClick={onClose}>
                    취소
                </button>
                <button className="be-btn be-btn-primary" disabled={posting}>
                    {posting ? "등록 중..." : "등록"}
                </button>
            </div>
        </form>
    );
};

const CommentNode = ({
                         c,
                         depth,
                         maxDepth = 1,
                         childrenByParent,
                         replyingId,
                         onToggleReply,
                         onDelete,
                         posting,
                         postComment,
                         setReplyingId,
                         replyInputRef,
                     }) => {
    const children = childrenByParent.get(c.commentId) || [];
    const isReplyingHere = replyingId === c.commentId;
    const allowReplyHere = depth === 0; // ✨ 루트만 답글 허용

    return (
        <li className="be-comment-item" data-depth={depth}>
            <div className="be-comment-meta">
                <span className="be-comment-author">{c.writerName}</span>
                <span className="be-comment-date">
          {String(c.createdAt ?? "").slice(0, 16).replace("T", " ")}
        </span>
            </div>
            <div className="be-comment-content">{c.content}</div>

            <div className="be-comment-ops">
                {allowReplyHere && (
                    <button
                        type="button"
                        className="be-link"
                        onClick={() => onToggleReply(c.commentId, depth)}
                    >
                        답글쓰기{(children?.length ?? 0) > 0 ? ` (${children.length})` : ""}
                    </button>
                )}
                <button type="button" className="be-link danger" onClick={() => onDelete(c.commentId)}>
                    삭제
                </button>
            </div>

            {isReplyingHere && allowReplyHere && (
                <ReplyInlineForm
                    parentId={c.commentId}
                    posting={posting}
                    postComment={postComment}
                    onClose={() => setReplyingId(null)}
                    inputRef={replyInputRef}
                />
            )}

            {children.length > 0 && depth < maxDepth && (
                <ul className="be-comment-children" style={{display: "block", marginLeft: 16, paddingLeft: 0}}>
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
                            replyInputRef={replyInputRef}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const MemoCommentNode = memo(CommentNode);

export default BoardComment;
