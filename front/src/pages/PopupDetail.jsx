import PopupImage from "../components/popupdetail/PopupImage.jsx";
import PopupInfo from "../components/popupdetail/PopupInfo.jsx";
import {useEffect, useState} from "react";
import apiRequest from "../utils/apiRequest.js";
import '../style/popupDetail.css';
import PopupReservation from "../components/popupdetail/PopupReservation.jsx";
import PopupReview from "../components/popupdetail/PopupReview.jsx";
import PopupTabInfo from "../components/popupdetail/PopupTabInfo.jsx";
import PopupInquiry from "../components/popupdetail/PopupInquiry.jsx";
import Button from "../components/commons/Button.jsx";
import QrCode from "../components/qr/QrCode.jsx";

import {useParams} from "react-router-dom";
import PopupReservationModal from "../components/popupdetail/PopupReservationModal.jsx";

const PopupDetail = () => {
    const [popupDetail, setPopupDetail] = useState(null);
    const [activeTab, setActiveTab] = useState("예약"); // 기본 탭
    const [tabs, setTabs] = useState(["예약", "팝업 정보", "리뷰", "문의"]);
    const {id} = useParams();

    // 예약 정보 및 예약 모달
    const [reservationData, setReservationData] = useState({});
    const [modalOpen, setModalOpen] = useState(false);

    // qr 테스트
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        const fetchPopupDetail = async () => {
            const response = await apiRequest(`/popupStore/popupDetail?id=` + id, {
                credentials: "include",
            });
            setPopupDetail(response);
            if (new Date(response.end_date) < new Date().setHours(0, 0, 0, 0)) {
                setActiveTab("팝업 정보");
                setTabs(["팝업 정보", "리뷰", "문의"]);
            }
        }
        fetchPopupDetail();
    }, [])

    // 예약 버튼 클릭 시 모달 열기
    const openModal = (reservationData) => {
        setReservationData(reservationData); // 예약 정보 설정
        setModalOpen(true); // 모달 열기
    };

    return (
        <div className={"popupStore-detail inner"}>
            {popupDetail ? (
                <>
                    <PopupImage images={popupDetail.images}></PopupImage>
                    <PopupInfo popup={popupDetail}></PopupInfo>

                    <div className={"menu-tab"}>
                        {tabs.map((tab) => (
                            <Button
                                key={tab}
                                className={activeTab === tab ? "tab active" : "tab"}
                                onClick={() => setActiveTab(tab)}
                            >{tab}</Button>
                        ))}
                    </div>

                    {activeTab === "예약" && (
                        <PopupReservation popup={popupDetail} onOpenModal={openModal}></PopupReservation>
                    )}

                    {activeTab === "팝업 정보" && (
                        <PopupTabInfo popup={popupDetail}></PopupTabInfo>
                    )}

                    {activeTab === "리뷰" && (
                        <PopupReview popup={popupDetail}></PopupReview>
                    )}

                    {activeTab === "문의" && (
                        <PopupInquiry popup={popupDetail}></PopupInquiry>
                    )}
                    <button
                        onClick={() => {
                            setShowQr(true)
                        }}
                    >
                        QR 코드 생성
                    </button>
                    {showQr ? (<QrCode/>) : (
                        <></>
                    )}
                    {/* 모달 컴포넌트 추가 */}
                    <PopupReservationModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)} // 모달 닫기
                        reservationData={reservationData} // 예약 정보 전달
                    />
                </>
            ) : (<p>loading...</p>)}
        </div>
    )
}

export default PopupDetail