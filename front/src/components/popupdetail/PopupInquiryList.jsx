import {useEffect, useState} from "react";
import DOMPurify from "dompurify";
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx";
import InquiryModal from "../commons/InquiryModal.jsx";
import Pagination from "../commons/Pagination.jsx";
import Button from "../commons/Button.jsx";

const PAGE_SIZE = 5;

const isPlatformAdminFromUser = (user) => {
  if (!user) return false;
  const flag =
    user.isAdmin || user.is_admin || user.admin || user.isManager || user.is_manager;
  const pool = [];
  if (user.role) pool.push(user.role);
  if (user.userRole) pool.push(user.userRole);
  if (user.type) pool.push(user.type);
  if (user.user_type) pool.push(user.user_type);
  if (Array.isArray(user.roles)) pool.push(...user.roles);
  if (Array.isArray(user.authorities)) {
    pool.push(
      ...user.authorities
        .map((a) => (typeof a === "string" ? a : a?.authority))
        .filter(Boolean)
    );
  }
  const U = pool.map((s) => String(s).toUpperCase());
  const hasAdminWord = U.some((s) => /ADMIN|MANAGER|OPERATOR|STAFF|OWNER|SYSTEM/.test(s));
  return Boolean(flag || hasAdminWord);
};

const PopupInquiryList = ({popup, refreshFlag}) => {
  const [inquiries, setInquiries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [replies, setReplies] = useState([]);
  const [openedInquiryIds, setOpenedInquiryIds] = useState([]);
  const [replyContents, setReplyContents] = useState({});

  // 수정 모달
  const [editInquiry, setEditInquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [privateChecked, setPrivateChecked] = useState(false);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = useAuth().getToken();
  const user = useAuth().getUser();
  const sanitize = (html) =>
    DOMPurify.sanitize(String(html || ""), {USE_PROFILES: {html: true}});

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
    setOpenedInquiryIds([]);
  }, [popup.store_id, token, refreshFlag]);

  const handlePageChange = (page) => {
    fetchInquiries(page);
  };

  const toggleReplyHandler = (id) => {
    setOpenedInquiryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitReply = async (inquiryId) => {
    const body = replyContents[inquiryId];
    if (!body?.trim()) return alert("답변 내용을 입력해주세요.");
    try {
      await apiRequest(
        `/popupStore/inquiryReply`,
        {method: "POST", body: {inquiry_id: inquiryId, content: body, popup_id: popup.store_id}},
        token
      );
      setReplyContents((prev) => ({...prev, [inquiryId]: ""}));
      fetchInquiryReplies();
    } catch (e) {
      console.error("답변 등록 실패:", e);
      alert("답변 등록 실패");
    }
  };

  const modifyInquiry = (item) => {
    setEditInquiry(item);
    setSubject(item.subject);
    setContent(item.content);
    setPrivateChecked(!!item.isPrivate);
    setModalOpen(true);
  };

  const deleteInquiry = async (item) => {
    if (!window.confirm("문의를 삭제 하시겠습니까?")) return;
    try {
      await apiRequest(`/popupStore/deleteInquiry/${item.id}`, {method: "DELETE"}, token);
      alert("문의가 삭제되었습니다.");
      fetchInquiries(currentPage);
    } catch (e) {
      console.error("문의 삭제 실패:", e);
      alert("문의 삭제 실패");
    }
  };

  const maskName = (name = "") => {
    const s = String(name || "");
    if (s.length <= 1) return s;
    if (s.length === 2) return s[0] + "*";
    return s[0] + "*" + s.slice(-1);
  };

  if (loading) return <p>문의 목록을 불러오는 중...</p>;

  return (
    <div className="popupInquiry-panel">
      {/* 수정 모달 */}
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
              {method: "PUT", body: {subject, content, isPrivate: privateChecked}},
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

      <div className="popupInquiry-scroll">
        <div className="popupInquiry-list">
          {inquiries.length === 0 ? (
            <p className="empty-state">등록된 문의가 없습니다.</p>
          ) : (
            inquiries.map((item) => {
              const isOpen = openedInquiryIds.includes(item.id);
              const itemReplies = replies.filter((r) => r.inquiry.id === item.id);

              // 권한 계산
              const isOwner = item.user?.user_id === user?.user_id;
              const viewerVendorId = user?.vendor_id ?? user?.vendor?.vendor_id;
              const popupVendorId = popup?.vendor?.vendor_id ?? popup?.vendor_id;
              const isVendorForThisPopup = viewerVendorId && popupVendorId && viewerVendorId === popupVendorId;
              const isPlatformAdmin = isPlatformAdminFromUser(user);

              const isPrivateForViewer =
                Boolean(item.isPrivate) && !(isOwner || isVendorForThisPopup || isPlatformAdmin);

              const canView = !isPrivateForViewer;

              const titleText = canView ? (item.subject || "제목 없음") : "비공개 문의입니다.";
              const titleClass = `title ${canView ? "is-public" : "is-private"}`;

              const itemClass =
                "inquiry-item" +
                (isPrivateForViewer ? " private" : "") +
                (itemReplies.length > 0 ? " has-reply" : "");

              return (
                <div key={item.id} className={itemClass}>
                  {/* 상단 메타 */}
                  <p className="user createdAt">
                    {maskName(item.user?.name)} | {new Date(item.created_at).toLocaleDateString()}
                    {isOwner && (
                      <span className="btn-wrapper">
                        <button onClick={() => modifyInquiry(item)}>수정하기</button>
                        |
                        <button onClick={() => deleteInquiry(item)}>삭제하기</button>
                      </span>
                    )}
                  </p>

                  {/* 권한 있을 때만 토글 */}
                  <div className="item-1">
                    <p
                      className={titleClass}
                      style={!canView ? { color: "var(--gray-color)" } : undefined}
                    >
                      {!canView && (
                        <img
                          src="/icon-password-inactive.png"
                          alt="비공개"
                          className="lock-img"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      {titleText}
                    </p>

                    {canView && (
                      <Button
                        variant="ghost"
                        onClick={() => toggleReplyHandler(item.id)}
                        className="btn-reply-toggle"
                        aria-expanded={isOpen}
                        aria-controls={`inq-collapse-${item.id}`}
                      >
                        {isOpen ? "접기" : "더보기"}
                        <span className={`toggle-arrow ${isOpen ? "open" : ""}`}>▾</span>
                      </Button>
                    )}
                  </div>

                  {/* 권한 있을 때만 펼치기 */}
                  {canView && (
                    <div
                      id={`inq-collapse-${item.id}`}
                      className={`inquiry-replies ${isOpen ? "open" : ""}`}
                    >
                      {/* 문의 본문 */}
                      {isOpen && (
                        <div
                          className="question"
                          dangerouslySetInnerHTML={{ __html: sanitize(item.content) }}
                        />
                      )}

                      {/* 관리자 댓글 */}
                      {isOpen && (
                        <>
                          {itemReplies.length > 0 ? (
                            itemReplies.map((rep) => (
                              <div className="admin-reply" key={rep.id}>

                                <div className="reply-body">
                                  <div className="reply-meta">
                                    <span className="badge-admin">관리자</span>
                                    <span className="reply-createdAt">
                                      {new Date(rep.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div
                                    className="reply-html"
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(rep.content || ""),
                                    }}
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-content">답변을 기다려주세요</p>
                          )}

                          {(isVendorForThisPopup || isPlatformAdmin) && (
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
                              <Button variant="primary" color="red"  onClick={() => submitReply(item.id)}>
                                답변 등록
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="popupInquiry-pagination fixed">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PopupInquiryList;
