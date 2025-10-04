import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest.js";
import ReviewModal from "./ReviewModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import SearchHeader from "../commons/SearchHeader.jsx";
import Button from "../commons/Button.jsx";

const sanitize = (html) =>
  DOMPurify.sanitize(String(html || ""), { USE_PROFILES: { html: true } });

// 플랫폼 관리자 판별(넓게)
const isPlatformAdminFromUser = (user) => {
  if (!user) return false;
  const flag =
    user.isAdmin || user.is_admin || user.admin || user.isManager || user.is_manager;
  const pool = [];
  if (user.role) pool.push(user.role);
  if (user.userRole) pool.push(user.userRole);
  if (user.type) pool.push(user.type);
  if (user.user_type) pool.push(user.user_type);
  if (Array.isArray(user.roles)) pool.push(...user.roles);
  if (Array.isArray(user.authorities)) {
    pool.push(
      ...user.authorities
        .map((a) => (typeof a === "string" ? a : a?.authority))
        .filter(Boolean)
    );
  }
  const U = pool.map((s) => String(s).toUpperCase());
  const hasAdminWord = U.some((s) => /ADMIN|MANAGER|OPERATOR|STAFF|OWNER|SYSTEM/.test(s));
  return Boolean(flag || hasAdminWord);
};

const PopupReview = ({ popup }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewReplies, setReviewReplies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openIds, setOpenIds] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [editReview, setEditReview] = useState(null);

  const token = useAuth().getToken();
  const user = useAuth().getUser();
  const nav = useNavigate();

  const fetchReview = async (page = 1, keyword = "") => {
    const qs = new URLSearchParams({ popupId: popup.store_id, page: page - 1 });
    if (keyword) qs.append("keyword", keyword);
    const res = await apiRequest(`/popupStore/popupReview?${qs}`, { credentials: "include" }, token);
    setReviews(res?.content || []);
  };

  const fetchReviewReply = async () => {
    const res = await apiRequest(
      `/popupStore/popupReviewReply?popupId=${popup.store_id}`,
      { credentials: "include" },
      token
    );
    setReviewReplies(res || []);
  };

  const submitReply = async (reviewId) => {
    const text = replyInputs[reviewId];
    if (!text?.trim()) return alert("댓글 내용을 입력해주세요!");
    await apiRequest(
      `/popupStore/popupReviewReply`,
      { method: "POST", body: { review: reviewId, content: text } },
      token
    );
    setReplyInputs((p) => ({ ...p, [reviewId]: "" }));
    fetchReviewReply();
  };

  const reviewSearchHandler = () => fetchReview(1, searchKeyword);

  const toggleOpen = (id) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const modifyReview = (rv) => {
    setEditReview(rv);
    setIsModalOpen(true);
  };

  const deleteReview = async (rv) => {
    if (!window.confirm("리뷰를 삭제 하시겠습니까?")) return;
    await apiRequest(`/popupStore/deleteReview/${rv.review_id}`, { method: "DELETE" }, token);
    alert("글이 삭제되었습니다.");
    fetchReview(1, searchKeyword);
  };

  const isJoin = async () =>
    await apiRequest(`/reservations/isJoin?popupId=${popup.store_id}`, {}, token);

  const maskName = (name = "") => {
    const s = String(name || "");
    if (s.length <= 1) return s;
    if (s.length === 2) return s[0] + "*";
    return s[0] + "*" + s.slice(-1);
  };

  useEffect(() => {
    fetchReview();
    fetchReviewReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, popup.store_id]);

  if (!user) {
    return (
      <div className="msg-container" onClick={() => nav("/login")}>
        <p className="no-login">로그인 후 이용 가능합니다.</p>
      </div>
    );
  }

  // 권한 계산(벤더/플랫폼어드민)
  const viewerVendorId = user?.vendor_id ?? user?.vendor?.vendor_id;
  const popupVendorId = popup?.vendor?.vendor_id ?? popup?.vendor_id;
  const isVendorForThisPopup =
    viewerVendorId && popupVendorId && viewerVendorId === popupVendorId;
  const isPlatformAdmin = isPlatformAdminFromUser(user);

  return (
    <div className="popupReview-container">
      {/* 검색 + 총 리뷰 수 */}
      <div className="review-search">
        <div className="review-search-header">
          <p className="review-point">
            총 <span className="point-color">{reviews.length}개</span>의 리뷰가 등록되었습니다.
          </p>
          <SearchHeader
            searchValue={searchKeyword}
            onSearchChange={setSearchKeyword}
            onSearchClick={reviewSearchHandler}
            placeholder="리뷰 검색"
          />
        </div>

        {/* 리뷰 작성 버튼 */}
        <div
          className="review-btn"
          onClick={async () => {
            const joined = await isJoin();
            if (!joined) alert("팝업스토어 참여 후 리뷰 등록이 가능합니다!");
            else setIsModalOpen(true);
          }}
        >
          <p>리뷰 작성하기</p>
        </div>

        {/* 작성/수정 모달 */}
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditReview(null);
          }}
          popupId={popup.store_id}
          onSubmitSuccess={() => fetchReview(1, searchKeyword)}
          editData={editReview}
        />

        {/* 리스트 */}
        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="empty-state">등록된 리뷰가 없습니다.</p>
          ) : (
            reviews.map((item) => {
              const id = item.review_id;
              const isOpen = openIds.includes(id);
              const replies = reviewReplies.filter((r) => r.review === id);
              const isOwner = item.user?.user_id === user?.user_id;

              // 옵션/컬러 등 표시(있으면)
              const variant =
                item.option || item.color || item.variant || item.option_name || "";

              return (
                <div
                  key={id}
                  className={`review-item${replies.length > 0 ? " has-reply" : ""}`}
                >
                  {/* 상단 메타 */}
                  <p className="user createdAt">
                    {maskName(item.user?.name)}
                    {variant && <span className="variant"> · {variant}</span>} |{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                    {isOwner && (
                      <span className="btn-wrapper">
                        <button onClick={() => modifyReview(item)}>수정하기</button>
                        |
                        <button onClick={() => deleteReview(item)}>삭제하기</button>
                      </span>
                    )}
                  </p>

                  {/* 제목 + 더보기 */}
                  <div className="item-1">
                    <p className="title">{item.title || "제목 없음"}</p>
                    <Button
                      variant="ghost"
                      onClick={() => toggleOpen(id)}
                      className="btn-reply-toggle"
                      aria-expanded={isOpen}
                      aria-controls={`rev-collapse-${id}`}
                    >
                      {isOpen ? "접기" : "더보기"}
                      <span className={`toggle-arrow ${isOpen ? "open" : ""}`}>▾</span>
                    </Button>
                  </div>

                  {/* 펼침 영역 */}
                  <div
                    id={`rev-collapse-${id}`}
                    className={`review-body ${isOpen ? "open" : ""}`}
                  >
                    {isOpen && (
                      <>
                        {Array.isArray(item.images) && item.images.length > 0 ? (
                          <img
                            className="review-image-lg"
                            src={`http://localhost:8080/images?type=review&id=${item.images[0]}`}
                            alt="review"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}

                        <div
                          className="review-text ck-content"
                          dangerouslySetInnerHTML={{ __html: sanitize(item.content) }}
                        />

                        {/* 관리자 댓글 리스트 */}
                        <div className="review-replies">
                          {replies.length > 0 ? (
                            replies.map((reply) => (
                              <div key={reply.reply_id} className="admin-reply">
                                <div className="reply-body">
                                  <div className="reply-meta">
                                    <span className="badge-admin">관리자</span>
                                    <span className="reply-createdAt">
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div
                                    className="reply-html"
                                    dangerouslySetInnerHTML={{ __html: sanitize(reply.content || "") }}
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-content">답변을 기다려주세요</p>
                          )}
                        </div>

                        {/* 플랫폼관리자만 입력 가능 */}
                        {(isVendorForThisPopup || isPlatformAdmin) && (
                          <div className="vendor-reply">
                            <input
                              type="text"
                              placeholder="댓글 작성"
                              value={replyInputs[id] || ""}
                              onChange={(e) =>
                                setReplyInputs((p) => ({ ...p, [id]: e.target.value }))
                              }
                            />
                            <button className="reply-btn" onClick={() => submitReply(id)}>
                              등록
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupReview;
