import { useState } from "react";
import Button from "../commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";

const ReviewModal = ({ isOpen, onClose, popupId, onSubmitSuccess }) => {
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewContent, setReviewContent] = useState("");
    const [reviewFile, setReviewFile] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {

        // const userId = localStorage.getItem("user_id");
        const userId = "1";

        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("title", reviewTitle);
        formData.append("content", reviewContent);
        formData.append("popupId", popupId);
        formData.append("userId", userId);
        formData.append("type", "review");
        if (reviewFile) formData.append("file", reviewFile);

        try {
            await apiRequest(`/popupStore/popupReview`, {
                method: "POST",
                body: formData,
            });

            alert("리뷰가 등록되었습니다.");
            onSubmitSuccess();
            onClose();

            setReviewTitle("");
            setReviewContent("");
            setReviewFile(null);
        } catch (error) {
            console.error(error);
            alert("리뷰 등록에 실패했습니다.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>리뷰 작성</h2>
                <div className="modal-body">
                    <input
                        type="text"
                        placeholder="리뷰 제목"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="리뷰 내용"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        maxLength={300}
                        required
                    />
                    <input
                        type="file"
                        onChange={(e) => setReviewFile(e.target.files[0])}
                    />
                </div>

                <div className="modal-actions">
                    <Button onClick={handleSubmit}>등록</Button>
                    <Button onClick={onClose}>취소</Button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
