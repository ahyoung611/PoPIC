import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import InquiryModal from "../commons/InquiryModal.jsx";
import Pagination from "../commons/Pagination.jsx";

const PAGE_SIZE = 5;

const PopupInquiryList = ({ popup, refreshFlag }) => {
  const [inquiries, setInquiries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [replies, setReplies] = useState([]);
  const [openedInquiryIds, setOpenedInquiryIds] = useState([]);
  const [replyContents, setReplyContents] = useState({});

  // 수정 모달 상태
  const [editInquiry, setEditInquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [privateChecked, setPrivateChecked] = useState(false);

  // 서버 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = useAuth().getToken();
  const user = useAuth().getUser();
  const sanitize = (html) => DOMPurify.sanitize(String(html || ""), { USE_PROFILES: { html: true } });

  // 리스트 API
  const fetchInquiries = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiRequest(
        `/popupStore/inquiry?popupId=${popup.store_id}&page=${page - 1}&size=${PAGE_SIZE}`,
        {},
        token
      );
      setInquiries(res?.content || []);
      setTotalPages(res?.totalPages || 1);
      setCurrentPage((res?.number ?? 0) + 1);
      setTotalCount(res?.totalElements ?? (res?.content?.length || 0));
    } catch (e) {
      console.error("문의 목록 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  // 답변 API
  const fetchInquiryReplies = async () => {
    try {
      const res = await apiRequest(
        `/popupStore/inquiryReplies?popupId=${popup.store_id}`,
        {},
        token
      );
      setReplies(res || []);
    } catch (e) {
      console.error("답변 목록 실패:", e);
    }
  };

  useEffect(() => {
    fetchInquiries(1);
    fetchInquiryReplies();
    setOpenedInquiryIds([]); // 탭 전환/새로고침 시 접기 초기화
  }, [popup.store_id, token, refreshFlag]);

  // 페이지 변경
  const handlePageChange = (page) => {
    fetchInquiries(page);
  };

  // 접기/펼치기
  const toggleReplyHandler = (id) => {
    setOpenedInquiryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 답변 등록
  const submitReply = async (inquiryId) => {
    const body = replyContents[inquiryId];
    if (!body?.trim()) return alert("답변 내용을 입력해주세요.");
    try {
      await apiRequest(
        `/popupStore/inquiryReply`,
        { method: "POST", body: { inquiry_id: inquiryId, content: body, popup_id: popup.store_id } },
        token
      );
      setReplyContents((prev) => ({ ...prev, [inquiryId]: "" }));
      fetchInquiryReplies();
    } catch (e) {
      console.error("답변 등록 실패:", e);
      alert("답변 등록 실패");
    }
  };

  // 수정
  const modifyInquiry = (item) => {
    setEditInquiry(item);
    setSubject(item.subject);
    setContent(item.content);
    setPrivateChecked(!!item.isPrivate);
    setModalOpen(true);
  };

  // 삭제
  const deleteInquiry = async (item) => {
    if (!window.confirm("문의를 삭제 하시겠습니까?")) return;
    try {
      await apiRequest(`/popupStore/deleteInquiry/${item.id}`, { method: "DELETE" }, token);
      alert("문의가 삭제되었습니다.");
      fetchInquiries(currentPage);
    } catch (e) {
      console.error("문의 삭제 실패:", e);
      alert("문의 삭제 실패");
    }
  };

  // 마스킹
  const maskName = (name = "") => {
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + "*";
    return name[0] + "*" + name.slice(-1);
  };

  // HTML 요약
  const toPreview = (html, len = 120) => {
    const plain = (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return plain.length > len ? plain.slice(0, len) + "…" : plain || "내용 없음";
  };

  if (loading) return <p>문의 목록을 불러오는 중...</p>;

  return (
    <div className="popupInquiry-list">
      {/* 상단 카운트 */}
      {/* <div style={{ display: "flex", justifyContent: "space-between", margin: "0 7px 10px" }}>*/}
      {/*   <span>*/}
      {/*     총 <b className="point-color">{totalCount}</b>개의 문의가 등록되었습니다.*/}
      {/*   </span>*/}
      {/* </div>*/}

      {/* 수정 모달 */}
      <InquiryModal
        open={modalOpen}
        title="문의 수정"
        subject={subject}
        onSubjectChange={setSubject}
        content={content}
        onContentChange={setContent}  // CKEditor(툴바X)로 받도록 InquiryModal 내부 구현됨
        privateChecked={privateChecked}
        onPrivateChange={setPrivateChecked}
        onSubmit={async () => {
          if (!editInquiry) return;
          try {
            await apiRequest(
              `/popupStore/inquiry/${editInquiry.id}`,
              { method: "PUT", body: { subject, content, isPrivate: privateChecked } },
              token
            );
            await fetchInquiries(currentPage);
            alert("수정을 완료했습니다.");
            setModalOpen(false);
          } catch (e) {
            console.error("문의 수정 실패:", e);
            alert("수정 실패");
          }
        }}
        onClose={() => setModalOpen(false)}
        submitText="수정 완료"
      />

      {/* 리스트 */}
      {inquiries.length === 0 ? (
        <p>등록된 문의가 없습니다.</p>
      ) : (
        inquiries.map((item) => {
          const isOpen = openedInquiryIds.includes(item.id);
          const itemReplies = replies.filter((r) => r.inquiry.id === item.id);

          // 권한: 비공개는 작성자 or 해당 팝업 벤더만 열람
          const isOwner = item.user.user_id === user?.user_id;
          const isVendor = popup.vendor.vendor_id === user?.vendor_id;
          const canView = !item.isPrivate || isOwner || isVendor;

          return (
            <div key={item.id} className="inquiry-item">
              <div className="item-1">
                <p className="title">{item.subject}</p>
                {isOwner && (
                  <div className="btn-wrapper">
                    <button onClick={() => modifyInquiry(item)}>수정하기</button> |
                    <button onClick={() => deleteInquiry(item)}>삭제하기</button>
                  </div>
                )}
              </div>

              {/* 본문 */}
              <div className="content">
                {!canView ? (
                  <p>비공개 문의입니다.</p>
                ) : isOpen ? (
                  <div
                    className="inquiry-html"
                    dangerouslySetInnerHTML={{ __html: sanitize(item.content),
                    }}
                  />
                ) : (
                  <p>{toPreview(item.content)}</p>
                )}
              </div>

              <p className="user createdAt">
                {maskName(item.user.name)} | {new Date(item.created_at).toLocaleDateString()}
                {canView && (
                  <button onClick={() => toggleReplyHandler(item.id)} className="btn-reply-toggle">
                    {isOpen ? "접기" : "더보기"}{" "}
                    <span className={`toggle-arrow ${isOpen ? "open" : ""}`}>▾</span>
                  </button>
                )}
              </p>

              {/* 답변 */}
              {canView && (
                <div className={`inquiry-replies ${isOpen ? "open" : ""}`}>
                  {itemReplies.length > 0 ? (
                    itemReplies.map((rep) => (
                      <div
                        key={rep.id}
                        className="reply-html"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(rep.content || ""),
                        }}
                      />
                    ))
                  ) : (
                    <p className="no-content">답변을 기다려주세요</p>
                  )}

                  {isVendor && (
                    <div className="vendor-reply">
                      <input
                        value={replyContents[item.id] || ""}
                        placeholder="답변 등록하기"
                        onChange={(e) =>
                          setReplyContents((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                      <button className="reply-btn" onClick={() => submitReply(item.id)}>
                        답변 등록
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default PopupInquiryList;
