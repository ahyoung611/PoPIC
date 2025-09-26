const MyReservation = ({reservations}) => {
    return (
        <div className="reservation-list">
            {reservations.map(r => (
                <div key={r.reservationId} className="reservation-card">
                    <div className="thumb">
                        <img src={r.popup?.imageUrl || "/default.jpg"} alt="popup"/>
                    </div>
                    <div className="info">
                        <p><strong>예약번호</strong> {r.reservationId}</p>
                        <p><strong>예매일</strong> {r.slot?.start_time?.slice(0,10)}</p>
                        <p><strong>장소</strong> {r.popup?.address} {r.popup?.address_detail}</p>
                        <p><strong>상태</strong> 예약완료</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default MyReservation;
