import {useEffect, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";
import ReviewModal from "./ReviewModal.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import Pagination from "../commons/Pagination.jsx";
import DOMPurify from "dompurify";
import SearchHeader from "../commons/SearchHeader.jsx";

const PopupReview = ({popup}) => {
    const [review, setReview] = useState([]);
    const [reviewReply, setReviewReply] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openReplies, setOpenReplies] = useState({});
    const [replyInputs, setReplyInputs] = useState({});
    const [editReview, setEditReview] = useState(null);

    const token = useAuth().getToken();
    const user = useAuth().getUser();
    const nav = useNavigate();
    const sanitize = (html) =>
        DOMPurify.sanitize(String(html || ""), {USE_PROFILES: {html: true}});

    /** 리뷰 조회 (검색어 포함 가능) */
    const fetchReview = async (page = 1, keyword = "") => {
        const query = new URLSearchParams({
            popupId: popup.store_id,
            page: page - 1,
        });
        if (keyword) query.append("keyword", keyword);

        const response = await apiRequest(
            `/popupStore/popupReview?${query.toString()}`,
            {credentials: "include"},
            token
        );

        setReview(response.content || []);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(page);
    };

    /** 댓글 조회 */
    const fetchReviewReply = async () => {
        const response = await apiRequest(
            `/popupStore/popupReviewReply?popupId=${popup.store_id}`,
            {credentials: "include"},
            token
        );
        setReviewReply(response || []);
    };

    /** 댓글 등록 */
    const submitReply = async (reviewId) => {
        if (!replyInputs[reviewId]?.trim()) {
            alert("댓글 내용을 입력해주세요!");
            return;
        }

        await apiRequest(
            `/popupStore/popupReviewReply`,
            {
                method: "POST",
                body: {review: reviewId, content: replyInputs[reviewId]},
            },
            token
        );

        fetchReviewReply();
        setReplyInputs((prev) => ({...prev, [reviewId]: ""}));
    };

    /** 리뷰 검색 */
    const reviewSearchHandler = () => {
        fetchReview(1, searchKeyword); // 검색 시 항상 1페이지부터
    };

    /** 댓글 토글 */
    const toggleReplyHandler = (reviewId) => {
        setOpenReplies((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };

    /** 리뷰 수정 */
    const modifyReview = (review) => {
        setEditReview(review);
        setIsModalOpen(true);
    };

    /** 리뷰 삭제 */
    const deleteReview = async (review) => {
        if (!window.confirm("리뷰를 삭제 하시겠습니까?")) return;

        await apiRequest(`/popupStore/deleteReview/${review.review_id}`, {
            method: "DELETE",
        }, token);

        alert("글이 삭제되었습니다.");
        fetchReview(currentPage, searchKeyword);
    };

    /** 팝업 참여 여부 */
    const isJoin = async () =>
        await apiRequest(`/reservations/isJoin?popupId=${popup.store_id}`, {}, token);

    /** 이름 마스킹 */
    const maskName = (name) => {
        if (!name) return "";
        if (name.length === 1) return name;
        if (name.length === 2) return name[0] + "*";
        return name[0] + "*" + name.slice(-1);
    };

    /** 초기 데이터 로드 */
    useEffect(() => {
        fetchReview();
        fetchReviewReply();
    }, [token]);

    if (!user) {
        return (
            <div className="msg-container" onClick={() => nav("/login")}>
                <p className="no-login">로그인 후 이용 가능합니다.</p>
            </div>
        );
    }

    return (
        <div className="popupReview-container">
            {/* 검색 + 총 리뷰 수 */}
            <div className="review-search">
                <div className="review-search-header">
          <p className={"review-point"}>
            총 <span className="point-color">{review.length}개</span>의 리뷰가 등록되었습니다.
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

                {/* 리뷰 작성/수정 모달 */}
                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditReview(null);
                    }}
                    popupId={popup.store_id}
                    onSubmitSuccess={() => fetchReview(currentPage, searchKeyword)}
                    editData={editReview}
                />

                {/* 리뷰 리스트 */}
                {review.map((item, idx) => {
                    const replies = reviewReply.filter((r) => r.review === item.review_id);

                    return (
                        <div key={idx} className="review-wrapper">
                            <div className="review-header">
                                <div className="review-top">
                                    {item.images?.length > 0 && (
                                        <img
                                            className="review-image"
                                            src={`http://localhost:8080/images?type=review&id=${item.images[0]}`}
                                            alt="review"
                                        />
                                    )}
                                    {item.user.user_id === user.user_id && (
                                        <div className="btn-wrapper">
                                            <button onClick={() => modifyReview(item)}>수정하기</button>
                                            <p>|</p>
                                            <button onClick={() => deleteReview(item)}>삭제하기</button>
                                        </div>
                                    )}
                                </div>

                                <div className="review-info">
                                    <div className="info-1">
                                        <h2 className="review-title">{item.title}</h2>
                                        <span className="review-user review-date">
                      {maskName(item.user.name)} | {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                                    </div>
                                    <div className="review-content">
                                        <div
                                            className="ck-content"
                                            style={{flex: 1, marginRight: 8}}
                                            dangerouslySetInnerHTML={{__html: sanitize(item.content)}}
                                        />
                                        <div className="review-actions"
                                             onClick={() => toggleReplyHandler(item.review_id)}>
                                            더보기
                                            <span
                                                className={`toggle-arrow ${openReplies[item.review_id] ? "open" : ""}`}>
                        ▾
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 댓글 리스트 */}
                            {openReplies[item.review_id] && (
                                <div className="review-replies">
                                    {replies.length > 0 ? (
                                        replies.map((reply) => (
                                            <div key={reply.reply_id} className="reply">
                                                <div className="reply-1">
                                                    <span className="reply-author">관리자</span>
                                                    <span className="reply-createdAt">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                                                </div>
                                                <p className="reply-content">{reply.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-reply">답변을 기다려주세요</p>
                                    )}
                                </div>
                            )}

                            {/* 댓글 작성 */}
                            {user.vendor_id === popup.vendor.vendor_id && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="댓글 작성"
                                        className="reply-input"
                                        value={replyInputs[item.review_id] || ""}
                                        onChange={(e) =>
                                            setReplyInputs((prev) => ({...prev, [item.review_id]: e.target.value}))
                                        }
                                    />
                                    <button className="reply-submit" onClick={() => submitReply(item.review_id)}>
                                        등록
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => fetchReview(page, searchKeyword)} // 검색어 유지
                    />
                )}

            </div>
        </div>
    );
};

export default PopupReview;
