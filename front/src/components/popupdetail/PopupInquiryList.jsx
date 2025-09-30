import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import InquiryModal from "../commons/InquiryModal.jsx";
import Pagination from "../commons/Pagination.jsx";

const PopupInquiryList = ({ popup, refreshFlag }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replies, setReplies] = useState([]);
    const [openedInquiryIds, setOpenedInquiryIds] = useState([]);
    const [replyContents, setReplyContents] = useState({});

    const [editInquiry, setEditInquiry] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [privateChecked, setPrivateChecked] = useState(false);

    // 서버사이드 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;

    const token = useAuth().getToken();
    const user = useAuth().getUser();

    // 문의 목록 가져오기
    const fetchInquiries = async (page = 1) => {
        setLoading(true);
        try {
            const response = await apiRequest(
                `/popupStore/inquiry?popupId=${popup.store_id}&page=${page - 1}&size=${itemsPerPage}`,
                {},
                token
            );
            setInquiries(response.content || []);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(response.number + 1);
        } catch (error) {
            console.error("문의 목록 가져오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [popup.store_id, refreshFlag]);

    // 답변 목록 가져오기
    const fetchInquiryReplies = async () => {
        try {
            const res = await apiRequest(
                `/popupStore/inquiryReplies?popupId=${popup.store_id}`,
                {},
                token
            );
            setReplies(res || []);
        } catch (err) {
            console.error("답변 목록 가져오기 실패:", err);
        }
    };

    useEffect(() => {
        fetchInquiries();
        fetchInquiryReplies();
    }, [popup.store_id, token]);

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        fetchInquiries(page);
    };

    // 답변 토글
    const toggleReplyHandler = (id) => {
        setOpenedInquiryIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // 답변 등록
    const submitReply = async (inquiryId) => {
        const content = replyContents[inquiryId];
        if (!content?.trim()) return alert("답변 내용을 입력해주세요.");

        try {
            await apiRequest(
                `/popupStore/inquiryReply`,
                {
                    method: "POST",
                    body: {
                        inquiry_id: inquiryId,
                        content,
                        popup_id: popup.store_id,
                    },
                },
                token
            );
            setReplyContents((prev) => ({ ...prev, [inquiryId]: "" }));
            fetchInquiryReplies();
        } catch (err) {
            console.error("답변 등록 실패:", err);
            alert("답변 등록 실패");
        }
    };

    // 문의 수정
    const modifyInquiry = (item) => {
        setEditInquiry(item);
        setSubject(item.subject);
        setContent(item.content);
        setPrivateChecked(item.isPrivate);
        setModalOpen(true);
    };

    // 문의 삭제
    const deleteInquiry = async (item) => {
        if (!window.confirm("문의를 삭제 하시겠습니까?")) return;
        try {
            await apiRequest(`/popupStore/deleteInquiry/${item.id}`, { method: "DELETE" }, token);
            alert("문의가 삭제되었습니다.");
            fetchInquiries(currentPage);
        } catch (err) {
            console.error("문의 삭제 실패:", err);
            alert("문의 삭제 실패");
        }
    };

    const maskName = (name)=>{
        if (!name) return "";
        if (name.length === 1) return name; // 한 글자 이름은 그대로
        if (name.length === 2) return name[0] + "*"; // 두 글자는 마지막 글자만 가리기
        return name[0] + "*" + name.slice(-1);
    }

    if (loading) return <p>문의 목록을 불러오는 중...</p>;

    return (
        <div className="popupInquiry-list">
            {/* 문의 수정 모달 */}
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
                    if (!editInquiry) return;
                    try {
                        await apiRequest(
                            `/popupStore/inquiry/${editInquiry.id}`,
                            {
                                method: "PUT",
                                body: { subject, content, isPrivate: privateChecked },
                            },
                            token
                        );
                        await fetchInquiries(currentPage);
                        alert("수정을 완료했습니다.");
                        setModalOpen(false);
                    } catch (err) {
                        console.error("문의 수정 실패:", err);
                        alert("수정 실패");
                    }
                }}
                onClose={() => setModalOpen(false)}
                submitText="수정 완료"
            />

            {/* 문의 리스트 */}
            {inquiries.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                inquiries.map((item) => {
                    const matchedReplies = replies.filter((rep) => rep.inquiry.id === item.id);
                    const isOpen = openedInquiryIds.includes(item.id);

                    return (
                        <div key={item.id} className="inquiry-item">
                            <div className="item-1">
                                <p className="title">{item.subject}</p>
                                {item.user.user_id === user.user_id && (
                                    <div className="btn-wrapper">
                                        <button onClick={() => modifyInquiry(item)}>수정하기</button> |
                                        <button onClick={() => deleteInquiry(item)}>삭제하기</button>
                                    </div>
                                )}
                            </div>
                            <p className="content">
                                {item.isPrivate ? "비공개 문의입니다." : item.content}
                            </p>
                            <p className="user createdAt">
                                {maskName(item.user.name)} | {new Date(item.created_at).toLocaleDateString()}
                                <button
                                    onClick={() => toggleReplyHandler(item.id)}
                                    className="btn-reply-toggle"
                                >
                                    더보기 <span className={`toggle-arrow ${isOpen ? "open" : ""}`}>▾</span>
                                </button>
                            </p>

                            <div className={`inquiry-replies ${isOpen ? "open" : ""}`}>
                                {!item.isPrivate && matchedReplies.length > 0 ? (
                                    matchedReplies.map((rep) => <p key={rep.id}>{rep.content}</p>)
                                ) : (
                                    <p className="no-content">답변을 기다려주세요</p>
                                )}

                                {popup.vendor.vendor_id === user.vendor_id && (
                                    <div className="vendor-reply">
                                        <input
                                            value={replyContents[item.id] || ""}
                                            placeholder="답변 등록하기"
                                            onChange={(e) =>
                                                setReplyContents((prev) => ({
                                                    ...prev,
                                                    [item.id]: e.target.value,
                                                }))
                                            }
                                        />
                                        <button className="reply-btn" onClick={() => submitReply(item.id)}>
                                            답변 등록
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default PopupInquiryList;
