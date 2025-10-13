import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button.jsx";
import "../../style/modal.css";

export default function ConfirmModal({
  open,
  title = "확인하시겠습니까?",
  description = "",
  okText = "네",
  cancelText = "아니오",
  danger = false,
  closeOnOutside = true,
  closeOnEsc = true,
  onConfirm,
  onCancel,
}) {
  // 모달 닫기 핸들러
  const handleClose = () => {
    onCancel?.();
  };

  // 모달 확인 핸들러
  const handleConfirm = () => {
    onConfirm?.();
  };

  // 스크롤 잠금 복원
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "hidden";
      return () => {
        const scrollY = parseInt(document.body.style.top || "0") * -1;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflowY = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // 키보드(Escape, Enter) 이벤트 처리
  useEffect(() => {
    if (!closeOnEsc || !open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter") handleConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeOnEsc, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="modalMask"
      onClick={closeOnOutside ? handleClose : undefined}
      role="presentation"
    >
      <div
        className="modalPanel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modalTitle">{title}</h3>
        {description && <p className="modalDesc">{description}</p>}
        <div className="modalActions">
          {/* 확인 버튼 */}
          <Button variant="primary" color="red" onClick={handleConfirm}>
            {okText}
          </Button>
          {/* 취소 버튼 */}
          <Button
            variant="cancel"
            color="gray"
            onClick={handleClose}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}