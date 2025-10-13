import { useState, useMemo } from "react";
import PopupReservationCalendar from "./PopupReservationCalendar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../commons/Button.jsx";

const PopupReservation = ({ popup, onOpenModal }) => {
  const user = useAuth().getUser();
  const nav = useNavigate();

  const [reservationNumber, setReservationNumber] = useState(1);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const price = popup?.price ?? 0;
  const remaining = useMemo(() => {
    if (!selectedSlot) return 0;
    return Math.max(0, (selectedSlot.capacity ?? 0) - (selectedSlot.reserved_count ?? 0));
  }, [selectedSlot]);
  const totalPrice = useMemo(() => price * reservationNumber, [price, reservationNumber]);
  const format = (n) => n.toLocaleString("ko-KR");

  const handleCalendarChange = ({ date, slot }) => {
    setReservationDate(date || "");
    const start = slot?.start_time ?? slot?.startTime ?? "";
    setReservationTime(start);
    setSelectedSlot(slot || null);
  };

  if (!user) {
    return (
      <div className="msg-container" onClick={() => nav("/login")}>
        <p className="no-login">로그인 후 이용 가능합니다.</p>
      </div>
    );
  }

  const reservationSubmit = () => {
    if (!reservationDate) return alert("예약 날짜를 선택해주세요.");
    if (!reservationTime) return alert("예약 시간을 선택해주세요.");
    if (selectedSlot && remaining < reservationNumber) {
      return alert("해당 슬롯에 남은 자리가 부족합니다.");
    }

    onOpenModal({
      name: popup.store_name,
      date: reservationDate,
      time: reservationTime,
      price,
      reservationCount: reservationNumber,
      slot_id: selectedSlot?.slot_id,
      slot_version: selectedSlot?.version,
      popupId: popup?.store_id ?? null,
      remaining,
    });
  };

  return (
    <div className="popupReservation">
      {/* 상단 선택 영역 */}
      <div className="reserve-panel">
        {/* 달력 + 시간선택 */}
        <PopupReservationCalendar
          popup={popup}
          value={{ date: reservationDate || null, slot: selectedSlot }}
          onChange={handleCalendarChange}
        />

        {/* 수량/가격/버튼 */}
        <div className="reserve-summary">
          <div className="summary-row">
              <div className="summary-title">수량을 선택하세요.</div>
               <div className="summary-box">
              <div className="summary-left">
                   <div className="summary-sub">입장 예약</div>
                    <div className="summary-price">{format(price)}원</div>
              </div>

               <div className="summary-right">
               <div className="remain-row">
                  남은 수량 : <strong>{remaining}</strong>
                </div>

                <div className="qty-box">
                  <button
                    className="qty-btn"
                    onClick={() => setReservationNumber((n) => Math.max(1, n - 1))}
                  >
                    −
                  </button>
                  <span className="qty-num">{reservationNumber}</span>
                  <button
                    className="qty-btn"
                    onClick={() => {
                      if (reservationNumber >= 2) return alert("최대 2명까지 예약 가능합니다");
                      setReservationNumber((n) => n + 1);
                    }}
                  >
                    +
                  </button>
                </div>
          </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="total-row">
            <span>합계</span>
            <strong className="total">{format(totalPrice)}원</strong>
          </div>

          <Button variant="primary" color="red" className="reserve-btn" onClick={reservationSubmit}>
            예약하기
          </Button>
        </div>
      </div>

      {/* 안내 박스 */}
      <section className="popup-description">
        <h3 className="desc-title">예약 전 반드시 확인하세요!</h3>

        <div className="desc-card">
          <h4>예약안내</h4>
          <ol>
            <li>POPIC ID당 1회만 예약 가능하며, 예약자 포함 최대 2명까지 예약 가능합니다.</li>
            <li>사전예약은 회차별 60분 단위이며, 각 회차별로 이용 인원이 제한됩니다.</li>
            <li>방문이 어려우실 경우, 다른 고객을 위해 반드시 사전에 예약을 취소해 주세요.</li>
            <li>예약 완료 후 일정 변경은 불가하며, 변경을 원하시면 취소 후 재예약 바랍니다.</li>
            <li>사전 예약 인원이 조기 마감될 수 있으며, 취소표는 실시간으로 노출됩니다.</li>
          </ol>

          <h4>입장안내</h4>
          <ol>
            <li>원활한 입장을 위해 예약 시간에 맞춰 방문해 주세요.</li>
            <li>동반인이 있는 경우 반드시 함께 도착하셔야 입장 가능합니다.</li>
            <li>입장 시 POPIC 예약 화면 원본 확인이 필요합니다. (캡처 화면 불가)</li>
            <li>현장 상황에 따라 입장이 지연될 수 있습니다.</li>
            <li>예약 시간으로부터 10분 이내 미도착 시 입장이 제한될 수 있습니다.</li>
            <li>퇴장 후 재입장은 불가합니다.</li>
          </ol>

          <h4>상품 구매 안내</h4>
          <ol>
            <li>모든 상품은 한정 수량으로 조기 품절될 수 있습니다.</li>
            <li>결제는 카드만 가능합니다.</li>
            <li>재고는 실시간 변동되며, 수량은 사전 안내되지 않습니다.</li>
          </ol>

          <h4>환불</h4>
          <ol>
            <li>행사 당일 및 행사 시작 후에는 환불이 불가합니다.</li>
            <li>주최 측 사정으로 행사가 취소될 경우, 전액 환불됩니다.</li>
          </ol>

          <h4>유의사항</h4>
          <ol>
            <li>운영 방식은 상황에 따라 사전 고지 없이 변동될 수 있습니다.</li>
            <li>안내사항 및 유의사항 미숙지로 인한 문제에 대해서는 당사가 책임지지 않습니다.</li>
          </ol>
        </div>
      </section>
    </div>
  );
};

export default PopupReservation;
