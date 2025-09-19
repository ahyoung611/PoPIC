import Button from "../commons/Button.jsx";
import ConfirmModal from "../commons/ConfirmModal.jsx";
import { useState } from "react";

const PopupInfo = (props) => {
    const popup = props.popup;
    console.log("popup: ", popup);
    const [walkInModalOpen, setWalkInModalOpen] = useState(false);

    const walkInSubmit = () => {
        setWalkInModalOpen(true);
    }

    const walkInConfirm = async () => {
        try {
            console.log("walk-in issued for:", popup.store_name);
        } finally {
            setWalkInModalOpen(false); // 모달 닫기
        }
    };

    const walkInCancel = () => {
        setWalkInModalOpen(false);
    }

    return (
        <div className="popupInfo">
            <div className={"popup-title"}>{popup.store_name}</div>
            <div className={"popup-date"}>{popup.start_date}~{popup.end_date}</div>
            <div className={"popup-address"}>{popup.address} {popup.address_detail}</div>
            {new Date(popup.end_date) >= new Date().setHours(0, 0, 0, 0) ? (
                <Button variant={"primary"} color={"red"} onClick={walkInSubmit}>대기</Button>
            ) : (
                <Button variant={"label"} color={"gray"} disabled={true}>운영 종료</Button>
            )}
            <ConfirmModal
                open={walkInModalOpen}
                title="현장 대기하시겠습니까?"
                okText="대기하기"
                cancelText="취소"
                closeOnOutside={true}
                closeOnEsc={true}
                onConfirm={walkInConfirm}
                onCancel={walkInCancel}
            />
        </div>
    )
}

export default PopupInfo