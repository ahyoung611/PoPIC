const MyReservation = ({reservations, formatStatus}) => {

    return (
        <div>
            <h3>예약 내역</h3>
            {reservations
                .filter(r => r.status === 1 || r.status === 0) // 예약 완료, 참여 완료
                .map(r => (
                    <div key={r.reservationId}>
                        <p>팝업명: {r.popup?.store_name}</p>
                        <p>팝업시간: {r.slot?.start_time}</p>
                        <p>팝업장소: {r.popup?.address} {r.popup?.address_detail}</p>
                        <p>결제금액: {r.depositAmount}</p>
                        <p>상태: {formatStatus(r.status)}</p>
                    </div>
                ))}
        </div>
    );
};

export default MyReservation;
