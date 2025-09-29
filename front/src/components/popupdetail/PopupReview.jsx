import {useEffect, useRef, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";
import Button from "../commons/Button.jsx";
import ReviewModal from "./ReviewModal.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import Pagination from "../commons/Pagination.jsx";

const PopupReview = (props)=>{
    const [review, setReview] = useState([]);
    const [reviewReply, setReviewReply] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const keywordRef = useRef("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const token = useAuth().getToken();
    const [openReplies, setOpenReplies] = useState({});
    const [replyInputs, setReplyInputs] = useState({});
    const [editReview, setEditReview] = useState(null);
    const user = useAuth().getUser();
    const nav = useNavigate();


    const fetchReview = async (page = 1) => {
        const response = await apiRequest(`/popupStore/popupReview?popupId=${props.popup.store_id}&page=${page-1}`, {
            credentials: "include",
        },token);
        console.log("res: ",response);
        setReview(response.content);
        setTotalPages(response.totalPages);
        setCurrentPage(page);
    }

    const fetchReviewReply = async () => {
        const response = await apiRequest(`/popupStore/popupReviewReply?popupId=${props.popup.store_id}`, {
            credentials: "include",
        },token);
        setReviewReply(response);
    }

    const submitReply = async (reviewId) => {
        if (!replyInputs[reviewId] || replyInputs[reviewId].trim() === "") {
            alert("댓글 내용을 입력해주세요!");
            return;
        }

        const response = await apiRequest(`/popupStore/popupReviewReply`, {
            method: "POST",
            body: {
                review: reviewId,
                content: replyInputs[reviewId],
            },
        }, token);

        fetchReviewReply();

        // 입력창 비우기
        setReplyInputs((prev) => ({
            ...prev,
            [reviewId]: "",
        }));
    }

    useEffect(()=>{
        fetchReview();
        fetchReviewReply();
    },[token])

    const reviewSearchHandler = ()=>{
        const keyword = keywordRef.current.value;
        const fetchSearchReview = async () => {
            const response = await apiRequest(`/popupStore/popupReview?popupId=${props.popup.store_id}&keyword=${keyword}`, {
                credentials: "include",
            },token);
            setReview(response);
        }
        fetchSearchReview();
    }

    const toggleReplyHandler = (reviewId) => {
        setOpenReplies((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };

    const modifyReview = (review)=>{
        setEditReview(review);
        setIsModalOpen(true);
    }

    const deleteReview = async (review) => {
        if(!window.confirm("리뷰를 삭제 하시겠습니까?")) return;
        const fetchDeleteReview = async () => {
            const response = await apiRequest(`/popupStore/deleteReview/${review.review_id}`,{
                method: "DELETE",
            },token)
            alert("글이 삭제되었습니다.");
        }
        await fetchDeleteReview();
        fetchReview();
    }

    if(!user){
        return(
            <div className={"msg-container"} onClick={()=>{nav("/login")}}>
                <p className={"no-login"}>로그인 후 이용 가능합니다.</p>
            </div>
        )
    }

    return (
        <div className={"popupReview-container"}>
            <div className={"review-search"}>
                <div className={"review-search-header"}>
                    <span>총 <span className={"point-color"}>{review.length}개</span>의 리뷰가 등록되었습니다.</span>
                    <div className={"search-bar"}>
                        <input type="text" placeholder="리뷰 검색" ref={keywordRef} />
                        <Button onClick={reviewSearchHandler}>검색</Button><br/>
                    </div>
                </div>

                <div className={"review-btn"} onClick={()=>{setIsModalOpen(true)}}>
                    <p>리뷰 작성하기</p>
                </div>

                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    popupId={props.popup.store_id}
                    onSubmitSuccess={fetchReview}
                    editData={editReview}
                />

                {review.map((item, idx) => {
                    const replies = reviewReply.filter(
                        (reply) => reply.review === item.review_id
                    );

                    return (
                        <div key={idx} className="review-wrapper">
                            <div className="review-header">
                                {item.images && item.images.length > 0 && (
                                    <img
                                        className="review-image"
                                        src={`http://localhost:8080/images?type=review&id=${item.images[0]}`}
                                        alt="review"
                                    />
                                )}
                                <div className="review-info">
                                    <div className={"info-1"}>
                                        <h2 className="review-title">{item.title}</h2>
                                        <span className="review-user, review-date">{item.user.name} | {new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={"review-content"}>
                                        <p>{item.content}</p>
                                        <div className="review-actions">
                                            <button
                                                className="btn-reply-toggle"
                                                onClick={() => toggleReplyHandler(item.review_id)}
                                            >
                                                더보기
                                                <span className={`toggle-arrow ${openReplies[item.review_id] ? "open" : ""}`}>▾</span>
                                            </button>
                                        </div>
                                    </div>
                                    {item.user.user_id === user.user_id && (
                                        <div className={"btn-wrapper"}>
                                            <button onClick={()=>modifyReview(item)}>수정하기</button> |
                                            <button onClick={()=>deleteReview(item)}>삭제하기</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {openReplies[item.review_id] && (
                                <div className="review-replies">
                                    {replies.length > 0 ? (
                                        replies.map((reply) => (
                                            <div key={reply.reply_id} className="reply">
                                                <div className="reply-1">
                                                    <span className="reply-author">관리자</span>
                                                    <span className={"reply-createdAt"}>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="reply-content">{reply.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-reply">답변을 기다려주세요</p>
                                    )}
                                </div>
                            )}

                            {user.vendor_id === props.popup.vendor.vendor_id && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="댓글 작성"
                                        className="reply-input"
                                        value={replyInputs[item.review_id] || ""} // 해당 리뷰 id에 맞는 값만 표시
                                        onChange={(e) =>
                                            setReplyInputs((prev) => ({
                                                ...prev,
                                                [item.review_id]: e.target.value,
                                            }))
                                        }
                                    />
                                    <button
                                        className="reply-submit"
                                        onClick={() => submitReply(item.review_id)}
                                    >
                                        등록
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page)=>fetchReview(page)}
                />
            </div>
        </div>
    );
}

export default PopupReview;