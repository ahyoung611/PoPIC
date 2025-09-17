import {useState} from "react";

const PopupReservation = (props)=>{
    const [reservationNumber, setReservationNumber] = useState(1);

    function reservationSubmit(){
        console.log("reservationSubmit");
    }

    return (
        <div className="popupReservation">
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
    )
}
export default PopupReservation;