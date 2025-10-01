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
    const handleClose = () => {
        const scrollY = parseInt(document.body.style.top || "0") * -1;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflowY = "";
        window.scrollTo(0, scrollY);

        onCancel?.();
    };

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

   useEffect(() => {
       if (!open) return;

       const scrollY = window.scrollY;
       document.body.style.position = "fixed";
       document.body.style.top = `-${scrollY}px`;
       document.body.style.width = "100%";
       document.body.style.overflowY = "hidden";
   }, [open]);

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
