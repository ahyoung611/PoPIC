import {useEffect, useState} from "react";
import Button from "../commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx";

const ReviewModal = ({ isOpen, onClose, popupId, onSubmitSuccess, editData }) => {
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewContent, setReviewContent] = useState("");
    const [reviewFile, setReviewFile] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const token = useAuth().getToken();
    const user = useAuth().getUser();

    useEffect(() => {
        if (editData) {
            setReviewTitle(editData.title);
            setReviewContent(editData.content);
            setExistingImage(editData.images?.[0] ?? null);
            setReviewFile(null);
        } else {
            setReviewTitle("");
            setReviewContent("");
            setExistingImage(null);
            setReviewFile(null);
        }
    }, [editData]);

    const handleSubmit = async () => {

        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        const userId = user.user_id;

        const formData = new FormData();
        formData.append("title", reviewTitle);
        formData.append("content", reviewContent);
        formData.append("popupId", popupId);
        formData.append("userId", userId);
        formData.append("type", "review");

        // 새 파일 있으면 추가, 없으면 기존 이미지 그대로 유지
        if (reviewFile) {
            formData.append("file", reviewFile);
        } else if (existingImage) {
            formData.append("existingImage", existingImage);
            // 서버에서 "기존 이미지 유지" 로직 처리
        } else {
            formData.append("existingImage", "");
        }

        try {
            await apiRequest(editData ? `/popupStore/popupReview/modify/${editData.review_id}`: `/popupStore/popupReview`,
                {
                            method: "POST",
                            body: formData,
                        },token);

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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{editData ? "리뷰 수정" : "리뷰 작성"}</h2>
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

                    {existingImage && !reviewFile && (
                        <div className="existing-image-preview">
                            <img
                                src={`http://localhost:8080/images?type=review&id=${existingImage}`}
                                alt="기존 이미지"
                                style={{ width: "120px", height: "auto", borderRadius: "8px" }}
                            />
                            <button onClick={() => setExistingImage(null)}>
                                이미지 제거
                            </button>
                        </div>
                    )}

                    {/* 새 파일 업로드 */}
                    <input
                        type="file"
                        onChange={(e) => setReviewFile(e.target.files[0])}
                    />
                </div>

                <div className="modal-actions">
                    <Button onClick={handleSubmit}>{editData ? "수정" : "등록"}</Button>
                    <Button onClick={onClose}>취소</Button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
