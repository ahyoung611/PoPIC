import PopupImage from "../components/popupdetail/PopupImage.jsx";
import PopupInfo from "../components/popupdetail/PopupInfo.jsx";
import {useEffect, useState} from "react";
import apiRequest from "../utils/apiRequest.js";
import PopupReservation from "../components/popupdetail/PopupReservation.jsx";
import PopupReview from "../components/popupdetail/PopupReview.jsx";
import PopupTabInfo from "../components/popupdetail/PopupTabInfo.jsx";
import PopupInquiry from "../components/popupdetail/PopupInquiry.jsx";
import QrCode from "../components/qr/QrCode.jsx";
import {useAuth} from "../context/AuthContext.jsx"
import {useLocation, useParams} from "react-router-dom";
import PopupReservationModal from "../components/popupdetail/PopupReservationModal.jsx";

import '../style/popupDetail.css';

const PopupDetail = () => {
    const {auth} = useAuth();
    const token = auth?.token;
    const user = auth?.user;
    const [popupDetail, setPopupDetail] = useState(null);
    const location = useLocation();
    const initTab = location.state?.tab || "팝업 정보";
    const [activeTab, setActiveTab] = useState(initTab);
    const [tabs, setTabs] = useState(["팝업 정보", "예약", "리뷰", "문의"]);
    const {id} = useParams();

    // 예약 정보 및 예약 모달
    const [reservationData, setReservationData] = useState({});
    const [modalOpen, setModalOpen] = useState(false);

    // qr 테스트
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        const fetchPopupDetail = async () => {

            const response = await apiRequest(`/popupStore/popupDetail?id=` + id, {}, token);
            setPopupDetail(response);
            if (response?.end_date) {
                const endDate = new Date(response.end_date);
                const today = new Date().setHours(0, 0, 0, 0);

                if (endDate < today) {
                    setActiveTab("팝업 정보");
                    setTabs(["팝업 정보", "리뷰", "문의"]);
                }
            }
        };
        fetchPopupDetail();
    }, [token, id]);

    const openModal = (reservationData) => {
        setReservationData(reservationData);
        setModalOpen(true);
    };

    return (
        <div className={"container"}>
            <div className={"popupStore-detail inner"}>
                {popupDetail ? (
                    <>
                        <PopupImage images={popupDetail.images || []}></PopupImage>
                        <PopupInfo popup={popupDetail}></PopupInfo>

                        <div className={"menu-tab"}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={activeTab === tab ? "tab active" : "tab"}
                                    onClick={() => setActiveTab(tab)}
                                >{tab}</button>
                            ))}
                        </div>

                        {activeTab === "팝업 정보" && (
                            <PopupTabInfo popup={popupDetail}></PopupTabInfo>
                        )}

                        {activeTab === "예약" && (
                            <PopupReservation popup={popupDetail} onOpenModal={openModal}></PopupReservation>
                        )}

                        {activeTab === "리뷰" && (
                            <PopupReview popup={popupDetail}></PopupReview>
                        )}
                        {activeTab === "문의" && (
                            <PopupInquiry popup={popupDetail}></PopupInquiry>
                        )}
                        {/* 모달 컴포넌트*/}
                        <PopupReservationModal
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            reservationData={reservationData}
                        />
                    </>
                ) : (<p>loading...</p>)}

            </div>
        </div>
    )
}

export default PopupDetail;