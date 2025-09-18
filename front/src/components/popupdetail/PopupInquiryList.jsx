import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest.js";

const PopupInquiryList = ({ popup }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await apiRequest(`/popupStore/inquiry?popupId=${popup.store_id}`);
                setInquiries(response); // response가 array라고 가정
            } catch (error) {
                console.error("문의 목록 가져오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInquiries();
    }, [popup.store_id]);

    if (loading) return <p>문의 목록을 불러오는 중...</p>;

    return (
        <div className="popupInquiry-list">
            {inquiries.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                inquiries.map((item) => (
                    <div key={item.id} className="inquiry-item">
                        <p><strong>제목:</strong> {item.subject}</p>
                        <p><strong>내용:</strong> {item.isPrivate ? item.content : "비공개 문의입니다."}</p>
                        <p><strong>작성자:</strong> {item.user.name}</p>
                        <p><strong>작성일:</strong> {new Date(item.created_at).toLocaleString()}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default PopupInquiryList;
