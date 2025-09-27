import {useEffect, useRef, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";
import Button from "../commons/Button.jsx";
import ReviewModal from "./ReviewModal.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

const PopupReview = (props)=>{
    const [review, setReview] = useState([]);
    const [reviewReply, setReviewReply] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const keywordRef = useRef("");
    const [idx, setIdx] = useState(0);
    const token = useAuth().getToken();
    const [openReplies, setOpenReplies] = useState({});


    const fetchReview = async () => {
        const response = await apiRequest(`/popupStore/popupReview?popupId=` + props.popup.store_id , {
            credentials: "include",
        },token);
        setReview(response);
    }

    useEffect(()=>{
        fetchReview();
        const fetchReviewReply = async () => {
            const response = await apiRequest(`/popupStore/popupReviewReply?popupId=${props.popup.store_id}`, {
                credentials: "include",
            },token);
            setReviewReply(response);
        }
        fetchReviewReply();
    },[token])

    const reviewSearchHandler = ()=>{
        const keyword = keywordRef.current.value;
        const fetchSearchReview = async () => {
            const response = await apiRequest(`/popupStore/popupReview?popupId=` + props.popup.store_id + "&keyword=" + keyword , {
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
                />

                {review.map((item, idx) => {
                    const replies = reviewReply.filter(
                        (reply) => reply.review_id === item.id
                    );

                    return (
                        <div key={idx} className="review-wrapper">
                            <div className="review-header">
                                <img
                                    className="review-image"
                                    src={`http://localhost:8080/images?type=review&id=${item.images[idx]}`}
                                    alt="review"
                                />
                                <div className="review-info">
                                    <h2 className="review-title">{item.title}</h2>
                                    <span className="review-user, review-date">{item.user.name} | {new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="review-content">{item.content}</p>
                            </div>


                            <div className="review-actions">
                                <button
                                    className="btn-reply-toggle"
                                    onClick={() => toggleReplyHandler(item.id)}
                                >
                                    더보기
                                    <span className={`toggle-arrow ${openReplies[item.id] ? "open" : ""}`}>▾</span>
                                </button>
                            </div>

                            {openReplies[item.id] && (
                                <div className="review-replies">
                                    {replies.length > 0 ? (
                                        replies.map((reply) => (
                                            <div key={reply.reply_id} className="reply">
                                                <span className="reply-author">관리자</span>
                                                <p className="reply-content">{reply.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-reply">답변을 기다려주세요</p>
                                    )}
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="댓글 작성"
                                className="reply-input"
                            />
                            <button className="reply-submit">등록</button>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default PopupReview;