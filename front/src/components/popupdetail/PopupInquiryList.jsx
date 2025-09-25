import {useEffect, useRef, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";

const PopupInquiryList = ({ popup }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replies, setReplies] = useState([]);
    const [openedInquiryIds, setOpenedInquiryIds] = useState([]); // ✅ 각 문의별 답변창 열림 상태
    const token = useAuth().getToken();
    const user = useAuth().getUser();
    const reply = useRef("");

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await apiRequest(`/popupStore/inquiry?popupId=${popup.store_id}`, {}, token);
                setInquiries(response);
            } catch (error) {
                console.error("문의 목록 가져오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
        fetchInquiryReplies();
    }, [popup.store_id, token]);

    const fetchInquiryReplies = async () => {
        const res = await apiRequest(`/popupStore/inquiryReplies?popupId=${popup.store_id}`, {}, token);
        setReplies(res);
    };

    const toggleReplyHandler = (id) => {
        setOpenedInquiryIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const submitReply = async (inquiryId) => {
        const content = reply.current.value;
        if (!content.trim()) return alert("답변 내용을 입력해주세요.");

        try {
            const data = await apiRequest(
                `/popupStore/inquiryReply`, // 실제 엔드포인트 확인 필요
                {
                    method: "POST",
                    body: {
                        inquiry_id: inquiryId,
                        content: content,
                        popup_id: popup.store_id, // DTO에 맞춰서 추가
                    }
                },
                token
            );
            reply.current.value = ""; // 입력창 초기화
            fetchInquiryReplies();   // 답변 목록 새로고침
        } catch (error) {
            console.error("답변 등록 실패:", error);
            alert("답변 등록 실패");
        }
    };

    if (loading) return <p>문의 목록을 불러오는 중...</p>;

    return (
        <div className="popupInquiry-list">
            {inquiries.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                inquiries.map((item) => {
                    const matchedReplies = replies.filter((rep) => rep.inquiry.id === item.id);
                    const isOpen = openedInquiryIds.includes(item.id);

                    return (
                        <div key={item.id} className="inquiry-item">
                            <p><strong>제목:</strong> {item.subject}</p>
                            <p><strong>내용:</strong> {item.isPrivate ? "비공개 문의입니다." : item.content}</p>
                            <p><strong>작성자:</strong> {item.user.name}</p>
                            <p><strong>작성일:</strong> {new Date(item.created_at).toLocaleString()}</p>

                            <button
                                onClick={() => toggleReplyHandler(item.id)}
                                className="btn-reply-toggle"
                            >
                                {isOpen ? "답변 닫기" : "답변 보기"}
                            </button>

                            {isOpen && (
                                <div className="inquiry-replies">
                                    {!item.isPrivate && matchedReplies.length > 0 ? (
                                        matchedReplies.map((rep) => (
                                            <p key={rep.id}><strong>답변:</strong> {rep.content}</p>
                                        ))
                                    ) : (
                                        <p><strong>답변을 기다려주세요</strong></p>
                                    )}

                                    {popup.vendor.vendor_id === user.vendor_id && (
                                        <div>
                                            <input ref={reply} placeholder="답변 등록하기" />
                                            <button onClick={() => submitReply(item.id)}>답변 등록</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default PopupInquiryList;
