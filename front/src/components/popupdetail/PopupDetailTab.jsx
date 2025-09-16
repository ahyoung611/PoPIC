import {useState} from "react";
import '../../style/popupDetailTab.css'

const PopupDetailTab = (popup)=>{
    const [activeTab, setActiveTab] = useState("예약"); // 기본 탭
    const [reservationNumber, setReservationNumber] = useState(1);
    const tabs = ["예약","팝업 정보","리뷰","문의"]

    function reservationSubmit(){
        console.log("reservationSubmit");
    }


    return(
        <div className={"popup-detail-tab"}>
            <div className={"menu-tab"}>
                {tabs.map((tab)=>(
                    <button
                    key={tab}
                    className={activeTab === tab ? "tab active" : "tab"}
                    onClick={() => setActiveTab(tab)}
                    >{tab}</button>
                ))}
            </div>
            <div className={"tab-content"}>
                {activeTab === "예약" && (
                    <div className={"reservation-content"}>
                        {/* 예약 관련 내용 */}

                        <div className={"reservation-date-input"}>
                            <input type={"date"} name={"reservationDate"}/>
                            <input type={"time"} name={"reservationTime"}/>
                        </div>

                        <div className={"reservation-number-input"}>
                            <p>입장 예약</p>
                            <button className={"minus"} onClick={()=>{
                                if(reservationNumber > 1){
                                    setReservationNumber(prev=> prev-1);
                                }else{
                                    alert("최소 1명 이상 예약 가능합니다");
                                }
                            }}>-</button>
                            <span>{reservationNumber}명</span>
                            <button className={"plus"} onClick={()=>{
                                if(reservationNumber <= 1){
                                    setReservationNumber(prev=> prev+1);
                                }else{
                                    alert("최대 2명 까지 예약 가능합니다");
                                }
                            }}>+</button>
                        </div>

                        <div className={"reservation-submit"}>
                            <button className={"reservation-btn"} onClick={reservationSubmit}>예약</button>
                        </div>

                        <div className={"reservation-info"}>
                            <p>예약 전 반드시 확인하세요!</p>
                            <div className={"reservation-content"}>
                                <p>예약안내</p>
                                <p>1.ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</p>
                                <p>2.ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</p>
                                <p>3.ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</p>
                                <p>4.ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</p>
                                <p>5.ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</p>
                            </div>
                        </div>

                    </div>
                )}
                {activeTab === "팝업 정보" && (
                    <div className={"popup-info"}>
                        {/* 팝업 정보 내용 */}
                        팝업정보
                    </div>
                )}
                {activeTab === "리뷰" && (
                    <div className={"review-content"}>
                        {/* 리뷰 내용 */}
                        리뷰
                    </div>
                )}
                {activeTab === "문의" && (
                    <div className={"inquiry-content"}>
                        {/* 문의 내용 */}
                        문의
                    </div>
                )}
            </div>
        </div>
    )
}

export default PopupDetailTab;