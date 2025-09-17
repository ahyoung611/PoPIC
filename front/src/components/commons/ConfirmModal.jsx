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
    if (!open) return null;

    useEffect(() => {
        if (!closeOnEsc) return;
        const onKey = (e) => {
            if (e.key === "Escape") onCancel?.();
            if (e.key === "Enter") onConfirm?.();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [closeOnEsc, onCancel, onConfirm]);

    // 바디 스크롤 잠금
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "");
    }, []);

    return createPortal(
        <div
            className="modalMask"
            onClick={closeOnOutside ? onCancel : undefined}
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
                    {/* 확인 */}
                    <Button
                        className="modalBtn modalBtn--ok"
                        onClick={onConfirm}
                    >
                        {okText}
                    </Button>
                    {/* 취소 */}
                    <Button
                        className="modalBtn modalBtn--cancel"
                        variant="outline"
                        color="gray"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
