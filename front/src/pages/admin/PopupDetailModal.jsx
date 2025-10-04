import { useMemo } from "react";
import DOMPurify from "dompurify";
import Button from "../../components/commons/Button.jsx";
import PopupImage from "../../components/popupdetail/PopupImage.jsx";
import "../../style/adminPopupModal.css";

const PopupDetailModal = ({ popup, isOpen, onClose }) => {
  if (!isOpen) return null;

  // CKEditor에서 온 HTML을 안전하게 변환
  const sanitizedDescription = useMemo(() => {
    const raw = popup?.description ?? "";
    // 만약 태그가 전혀 없다면(순수 텍스트) 줄바꿈만 <br>로 치환
    const html = /</.test(raw) ? raw : raw.replace(/\n/g, "<br />");
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ["target", "rel"], // 링크에 종종 포함
    });
  }, [popup?.description]);

  return (
    <div className="popup-modal-backdrop" onClick={onClose}>
      <div
        className="popup-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="outline" color="gray" className="popup-close-btn" onClick={onClose}>✕</Button>
        <h2 className="popup-title">{popup.store_name}</h2>
        <div className="popup-image">
          <PopupImage images={popup.images} />
        </div>

        <div className="popup-info">
          <div className="popup-row">
            <h4 className="label">기간</h4>
            <p className="value">{popup.start_date} ~ {popup.end_date}</p>
          </div>
          <div className="popup-row">
            <h4 className="label">담당자</h4>
            <p className="value">{popup.vendor.manager_name}</p>
          </div>
          <div className="popup-row">
            <h4 className="label">전화번호</h4>
            <p className="value">{popup.vendor.phone_number}</p>
          </div>
          <div className="popup-row">
            <h4 className="label">카테고리</h4>
            <p className="value">{popup.category_names}</p>
          </div>
          <div className="popup-row">
            <h4 className="label">장소</h4>
            <p className="value">{popup.address} {popup.address_detail}</p>
          </div>
        </div>

        <div className="popup-detail is-description">
          <h4 className="label">팝업 소개</h4>
          <div
            className="value ck-content"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </div>
      </div>
    </div>
  );
};

export default PopupDetailModal;
