import Button from "../commons/Button.jsx";
import ConfirmModal from "../commons/ConfirmModal.jsx";
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";

const PopupInfo = (props) => {
    const popup = props.popup;
    const [walkInModalOpen, setWalkInModalOpen] = useState(false);
    const {auth, getToken} = useAuth();
    const token = getToken();
    const user = auth?.user;
    const navigate = useNavigate();
    const isLoggedIn = !!user?.user_id;

    const walkInSubmit = () => {
        setWalkInModalOpen(true);
    }
    console.log("Popup object:", popup);

    const walkInConfirm = async () => {
        if (!isLoggedIn) return;
        try {
            const response = await fetch(`/waiting/create?userId=${user?.user_id}&storeId=${popup.store_id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, // 필요하면 토큰 포함
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}), // user token 있는지 여부 추가
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

    // 비회원 진입해서 현장 대기 버튼 클릭시 로그인 페이지로 이동
    const goLogin = () => {
        // 로그인 페이지로 이동 (현재 경로 복귀용 next 쿼리 포함)
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        navigate(`/login?next=${next}`); // /login?next=${next}
        setWalkInModalOpen(false);
    };

    return (
        <div className="popupInfo">
            <div className="popup-left">
                <div className="popup-title"><p>{popup.store_name}</p></div>
                <div className="popup-date">{new Date(popup.start_date).toLocaleDateString(
                    "ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                    })
                    .replace(/\.$/, ""
                )} - {new Date(popup.end_date).toLocaleDateString(
                    "ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                    })
                    .replace(/\.$/, ""
                )}</div>
                <div className="popup-address">{popup.address} {popup.address_detail}</div>
            </div>

            <div className="popup-right">
                {new Date(popup.end_date) >= new Date().setHours(0, 0, 0, 0) ? (
                    <Button variant="primary" color="red" onClick={walkInSubmit}>현장 대기</Button>
                ) : (
                    <Button variant="label" color="gray" disabled>운영 종료</Button>
                )}
            </div>

            {/* 기존 컨펌 모달 */}
{/*            <ConfirmModal
                open={walkInModalOpen}
                title="현장 대기 신청"
                description={
                    <span className="walkInModalDescription">
                    순서가 오면 바로 입장해주세요.<br/>
                    (10분 초과 시 자동 취소)
                    </span>
                }
                okText="현장 대기"
                cancelText="취소"
                closeOnOutside
                closeOnEsc
                onConfirm={walkInConfirm}
                onCancel={walkInCancel}
            />*/}

            <ConfirmModal
                open={walkInModalOpen}
                title="비회원 현장 대기"
                description={
                    <span className="walkInModalDescription">
                        순서가 오면 바로 입장해주세요.<br/>
                        (10분 초과 시 자동 취소)
                    </span>
                }
                okText="현장 대기"
                title={isLoggedIn ? "현장 대기 신청" : "로그인 필요"}
                description={
                    isLoggedIn ? (
                        <span className="walkInModalDescription">
                                순서가 오면 바로 입장해주세요.<br/>
                                (10분 초과 시 자동 취소)
                        </span>
                    ) : (
                        <span className="walkInModalDescription">
                                로그인 후 현장 대기가 가능합니다.
                        </span>
                    )
                }
                okText={isLoggedIn ? "현장 대기" : "로그인"}
                cancelText="취소"
                closeOnOutside
                closeOnEsc
                onConfirm={walkInConfirm}
                onConfirm={isLoggedIn ? walkInConfirm : goLogin}
                onCancel={walkInCancel}
            />
        </div>
    )
}

export default PopupInfo