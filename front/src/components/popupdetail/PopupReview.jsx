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



    return (
        <div className={"popupReview-container"}>
            <div className={"review-search"}>
                <span>총 {review.length}개의 리뷰가 등록되었습니다.</span>
                <input type="text" placeholder="리뷰 검색" ref={keywordRef} />
                <Button onClick={reviewSearchHandler}>검색</Button><br/>
                <Button onClick={()=>{setIsModalOpen(true)}}>리뷰 작성하기</Button>

                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    popupId={props.popup.store_id}
                    onSubmitSuccess={fetchReview}
                />

                {review.map((item) => {
                    const replies = reviewReply.filter(
                        (reply) => reply.review_id === item.id
                    );

                    return (
                        <div key={item.review_id} className="review-wrapper">
                            <img
                                className="popup-image"
                                src={`http://localhost:8080/images?type=review&id=${item.images[idx]}`}
                                alt="review-image"
                            />
                            <h2 className="review-title">{item.title}</h2>
                            <p>{item.user.name}</p>
                            <p>{new Date(item.createdAt).toLocaleString()}</p>
                            <p>{item.content}</p>

                            {replies.length > 0 && (
                                <div className="review-replies">
                                    <h4>답글</h4>
                                    {replies.map((reply) => (
                                        <p key={reply.reply_id}>{reply.content}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PopupReview;