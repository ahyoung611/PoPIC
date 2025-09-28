import {useEffect, useRef, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import InquiryModal from "../commons/InquiryModal.jsx";

const PopupInquiryList = ({ popup }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replies, setReplies] = useState([]);
    const [openedInquiryIds, setOpenedInquiryIds] = useState([]);
    const token = useAuth().getToken();
    const user = useAuth().getUser();
    const [replyContents, setReplyContents] = useState({});

    const [editInquiry, setEditInquiry] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [privateChecked, setPrivateChecked] = useState(false);

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

    useEffect(() => {
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
        const content = replyContents[inquiryId];
        console.log(content);
        if (!content.trim()) return alert("답변 내용을 입력해주세요.");

        try {
            const data = await apiRequest(
                `/popupStore/inquiryReply`,
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
            setReplyContents(prev => ({ ...prev, [inquiryId]: "" }));
        } catch (error) {
            console.error("답변 등록 실패:", error);
            alert("답변 등록 실패");
        }
        fetchInquiryReplies();   // 답변 목록 새로고침
    };

    const modifyInquiry = (item) => {
        setEditInquiry(item);          // 수정할 데이터
        setSubject(item.subject);      // 제목 초기화
        setContent(item.content);      // 내용 초기화
        setPrivateChecked(item.isPrivate); // 비공개 초기화
        setModalOpen(true);            // 모달 열기
    };

    const deleteInquiry = async (item) => {
        if(!window.confirm("문의를 삭제 하시겠습니까?")) return;
        const fetchDeleteInquiry = async () => {
            const response = await apiRequest(`/popupStore/deleteInquiry/${item.id}`,{
                method: "DELETE",
            },token)
            alert("문의가 삭제되었습니다.");
        }
        await fetchDeleteInquiry();
        fetchInquiries();
    }

    if (loading) return <p>문의 목록을 불러오는 중...</p>;

    return (
        <div className="popupInquiry-list">
            <InquiryModal
                open={modalOpen}
                title="문의 수정"
                subject={subject}
                onSubjectChange={setSubject}
                content={content}
                onContentChange={setContent}
                privateChecked={privateChecked}
                onPrivateChange={setPrivateChecked}
                onSubmit={async () => {
                    try {
                        await apiRequest(`/popupStore/inquiry/${editInquiry.id}`, {
                            method: "PUT",
                            body: {
                                subject,
                                content,
                                isPrivate: privateChecked,
                            },
                        }, token);

                        // 수정 후 리스트 새로고침
                        const response = await apiRequest(`/popupStore/inquiry?popupId=${popup.store_id}`, {}, token);
                        setInquiries(response);

                        alert("수정을 완료했습니다.");

                        // 모달 닫기
                        setModalOpen(false);
                    } catch (err) {
                        console.error("문의 수정 실패:", err);
                        alert("수정 실패");
                    }
                }}
                onClose={() => setModalOpen(false)}
                submitText="수정 완료"
            />

            {inquiries.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                inquiries.map((item) => {
                    const matchedReplies = replies.filter((rep) => rep.inquiry.id === item.id);
                    const isOpen = openedInquiryIds.includes(item.id);

                    return (
                        <div key={item.id} className="inquiry-item">
                            <div className={"item-1"}>
                                <p className={"title"}>{item.subject}</p>
                                {item.user.user_id === user.user_id && (
                                    <div className={"btn-wrapper"}>
                                        <button onClick={()=>modifyInquiry(item)}>수정하기</button> |
                                        <button onClick={()=>deleteInquiry(item)}>삭제하기</button>
                                    </div>
                                )}
                            </div>
                            <p className={"content"}>{item.isPrivate ? "비공개 문의입니다." : item.content}</p>
                            <p className={"user createdAt"}>{item.user.name} | {new Date(item.created_at).toLocaleDateString()}
                                <button
                                    onClick={() => toggleReplyHandler(item.id)}
                                    className="btn-reply-toggle"
                                >
                                    더보기 <span className={`toggle-arrow ${isOpen ? "open" : ""}`}>▾</span>
                                </button>
                            </p>

                            <div className={`inquiry-replies ${isOpen ? "open" : ""}`}>
                                {!item.isPrivate && matchedReplies.length > 0 ? (
                                    matchedReplies.map((rep) => (
                                        <p key={rep.id}>{rep.content}</p>
                                    ))
                                ) : (
                                    <p className={"no-content"}>답변을 기다려주세요</p>
                                )}

                                {popup.vendor.vendor_id === user.vendor_id && (
                                    <div key={item.id} className={"vendor-reply"}>
                                        <input value={replyContents[item.id]} placeholder="답변 등록하기"
                                        onChange={(e) =>setReplyContents(prev => ({ ...prev, [item.id]: e.target.value }))}/>
                                        <button className={"reply-btn"} onClick={() => submitReply(item.id)}>답변 등록</button>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })
            )}
        </div>
    );
};

export default PopupInquiryList;
