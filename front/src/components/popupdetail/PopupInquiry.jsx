import {useEffect, useState} from "react";
import InquiryModal from "../commons/InquiryModal.jsx";
import apiRequest from "../../utils/apiRequest.js";
import PopupInquiryList from "./PopupInquiryList.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

const PopupInquiry = ({popup})=>{

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
    const [subject, setSubject] = useState(""); // 제목
    const [content, setContent] = useState(""); // 내용
    const [isPrivate, setIsPrivate] = useState(false); // 비공개 체크 상태
    const token = useAuth().getToken();
    const user = useAuth().getUser();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async () => {
        try {
            const userId = user.user_id;
            const popupId = popup.store_id;

            const payload = {
                userId,
                popupId,
                subject,
                content,
                isPrivate,
            };

            // fetch 기반 apiRequest 사용
            const response = await apiRequest("/popupStore/inquiry", {
                method: "POST",
                body: payload,
            }, token);

            alert("문의가 정상적으로 전송되었습니다.");

            // 상태 초기화 및 모달 닫기
            setSubject("");
            setContent("");
            setIsPrivate(false);
            setIsModalOpen(false);
        } catch (error) {
            console.error("문의 전송 실패:", error);
            alert("문의 전송에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return(
        <div className={"popupInquiry-container"}>
            <div className={"inquiry-btn"} onClick={handleOpenModal}>
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
            <PopupInquiryList popup={popup}/>
        </div>
    )
}

export default PopupInquiry;