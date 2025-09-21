import {useEffect, useState} from "react";

const OperatorReservations = () => {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        fetch("/vendor/reservationList") // 모든 예약 리스트
            .then(res => res.json())
            .then(data => setReservations(data));
    }, []);

    return (
        <div>
            <h2>예약 관리</h2>
            {reservations.map(r => (
                <div key={r.id}>
                    <p>예약자: {r.userName}</p>
                    <p>주문번호: {r.orderId}</p>
                    <p>금액: {r.amount}</p>
                    <p>예약일: {r.date}</p>
                </div>
            ))}
        </div>
    );
}
export default OperatorReservations;