import {useState} from "react";
import PopupReservationCalendar from "./PopupReservationCalendar.jsx";

const PopupReservation = (props) => {
    const [reservationNumber, setReservationNumber] = useState(1);
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");

    const [selectedSlot, setSelectedSlot] = useState(null);
    const handleCalendarChange = ({date, slot}) => {
        setReservationDate(date || "");
        const start = slot?.start_time ?? slot?.startTime ?? "";
        setReservationTime(start);
        setSelectedSlot(slot || null);
    };

    function reservationSubmit() {
        if (reservationDate == "") {
            alert("예약 날짜를 선택해주세요.");
        } else if (reservationTime == "") {
            alert("예약 시간을 선택해주세요.");
        }

        // 예약 버튼을 클릭했을 때 모달에 정보를 전달
        const reservationData = {
            name: props.popup.store_name,
            date: reservationDate,
            time: reservationTime,
            price: props.popup?.price,
            reservationCount: reservationNumber,
            slot_id: selectedSlot?.slot_id,
            slot_version: selectedSlot?.version,
            popupId: props.popup?.store_id ?? null,
        };

        props.onOpenModal(reservationData); // 모달 열기 및 예약 데이터 전달
    }

    return (
        <div className="popupReservation">
            {/* 예약 관련 내용 */}
            <div className={"reservation-date-input"}>
                <PopupReservationCalendar
                    popup={props.popup}
                    value={{date: reservationDate || null, slot: selectedSlot}}
                    onChange={handleCalendarChange}
                />
            </div>

            <div className={"reservation-number-input"}>
                <p>입장 예약</p>
                <button className={"minus"} onClick={() => {
                    if (reservationNumber > 1) {
                        setReservationNumber(prev => prev - 1);
                    } else {
                        alert("최소 1명 이상 예약 가능합니다");
                    }
                }}>-
                </button>
                <span>{reservationNumber}명</span>
                <button className={"plus"} onClick={() => {
                    if (reservationNumber <= 1) {
                        setReservationNumber(prev => prev + 1);
                    } else {
                        alert("최대 2명 까지 예약 가능합니다");
                    }
                }}>+
                </button>
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