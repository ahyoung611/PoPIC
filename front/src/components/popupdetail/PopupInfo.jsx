import Button from "../commons/Button.jsx";
import ConfirmModal from "../commons/ConfirmModal.jsx";
import {useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";

const PopupInfo = (props) => {
    const popup = props.popup;
    const [walkInModalOpen, setWalkInModalOpen] = useState(false);
    const {auth, getToken} = useAuth();
    const token = getToken();
    const user = auth?.user;

    const walkInSubmit = () => {
        setWalkInModalOpen(true);
    }
    console.log("Popup object:", popup);

    const walkInConfirm = async () => {
        try {
            const response = await fetch(`/waiting/create?userId=${user?.user_id}&storeId=${popup.store_id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, // 필요하면 토큰 포함
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "대기 등록 실패");
                return;
            }
            console.log("대기 등록 성공:", data);
            alert(`대기번호 ${data.queueNumber}번으로 등록되었습니다.`);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setWalkInModalOpen(false);
        }
    };

    const walkInCancel = () => {
        setWalkInModalOpen(false);
    }

    return (
        <div className="popupInfo">
            <div className="popup-left">
                <div className="popup-title"><p>{popup.store_name}</p></div>
                <div className="popup-date">{popup.start_date} ~ {popup.end_date}</div>
                <div className="popup-address">{popup.address} {popup.address_detail}</div>
            </div>

            <div className="popup-right">
                {new Date(popup.end_date) >= new Date().setHours(0, 0, 0, 0) ? (
                    <Button variant="primary" color="red" onClick={walkInSubmit}>현장 대기</Button>
                ) : (
                    <Button variant="label" color="gray" disabled>운영 종료</Button>
                )}
            </div>

            <ConfirmModal
                open={walkInModalOpen}
                title="현장 대기하시겠습니까?"
                description={
                    <span className="walkInModalDescription">
                    순서가 호출되면 즉시 입장해 주세요.<br/>
                    호출 후 10분이 지나면 자동으로 취소됩니다
                    </span>
                }
                okText="대기하기"
                cancelText="취소"
                closeOnOutside
                closeOnEsc
                onConfirm={walkInConfirm}
                onCancel={walkInCancel}
            />
        </div>
    )
}

export default PopupInfo