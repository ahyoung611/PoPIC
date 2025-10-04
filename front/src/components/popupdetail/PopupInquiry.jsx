import { useState } from "react";
import InquiryModal from "../commons/InquiryModal.jsx";
import apiRequest from "../../utils/apiRequest.js";
import PopupInquiryList from "./PopupInquiryList.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const PopupInquiry = ({ popup }) => {
  const nav = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const token = useAuth().getToken();
  const user = useAuth().getUser();
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    try {
      const payload = {
        userId: user.user_id,
        popupId: popup.store_id,
        subject,
        content,
        isPrivate,
      };

      await apiRequest("/popupStore/inquiry", { method: "POST", body: payload }, token);

      alert("문의가 정상적으로 전송되었습니다.");

      setSubject("");
      setContent("");
      setIsPrivate(false);
      setIsModalOpen(false);
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error("문의 전송 실패:", error);
      alert("문의 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!user) {
    return (
      <div className="msg-container" onClick={() => nav("/login")}>
        <p className="no-login">로그인 후 이용 가능합니다.</p>
      </div>
    );
  }

  return (
    <div className="popupInquiry-container">
      <div className="inquiry-btn" onClick={handleOpenModal}>
        <p>판매자에게 문의하기</p>
      </div>

      <InquiryModal
        open={isModalOpen}
        title="문의하기"
        subject={subject}
        onSubjectChange={setSubject}
        content={content}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        privateChecked={isPrivate}
        onPrivateChange={setIsPrivate}
      />

      <PopupInquiryList popup={popup} refreshFlag={refreshFlag} />
    </div>
  );
};

export default PopupInquiry;
