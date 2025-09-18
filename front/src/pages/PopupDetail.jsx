import PopupImage from "../components/popupdetail/PopupImage.jsx";
import PopupInfo from "../components/popupdetail/PopupInfo.jsx";
import {useEffect, useState} from "react";
import apiRequest from "../utils/apiRequest.js";
import '../style/popupDetail.css';
import PopupReservation from "../components/popupdetail/PopupReservation.jsx";
import PopupReview from "../components/popupdetail/PopupReview.jsx";
import PopupTabInfo from "../components/popupdetail/PopupTabInfo.jsx";
import PopupInquiry from "../components/popupdetail/PopupInquiry.jsx";

const PopupDetail = ()=>{
    const [popupDetail, setPopupDetail] = useState(null);
    const [activeTab, setActiveTab] = useState("예약"); // 기본 탭
    const [tabs, setTabs] = useState(["예약","팝업 정보","리뷰","문의"]);

    useEffect(()=>{
        const fetchPopupDetail = async () => {
            const response = await apiRequest(`/popupStore/popupDetail?id=1`, {
                credentials: "include",
            });
            setPopupDetail(response);
            if(new Date(response.end_date) < new Date().setHours(0,0,0,0)){
                setActiveTab("팝업 정보");
                setTabs(["팝업 정보", "리뷰", "문의"]);
            }
        }
        fetchPopupDetail();
    },[])

    return(
        <div className={"popupStore-detail inner"}>
            {popupDetail ? (
                <>
                    <PopupImage images={popupDetail.images}></PopupImage>
                    <PopupInfo popup={popupDetail}></PopupInfo>

                    <div className={"menu-tab"}>
                        {tabs.map((tab)=>(
                            <button
                                key={tab}
                                className={activeTab === tab ? "tab active" : "tab"}
                                onClick={() => setActiveTab(tab)}
                            >{tab}</button>
                        ))}
                    </div>

                    {activeTab === "예약" && (
                        <PopupReservation popup={popupDetail}></PopupReservation>
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

                </>
            ) : (<p>loading...</p>)}
        </div>
    )
}

export default PopupDetail