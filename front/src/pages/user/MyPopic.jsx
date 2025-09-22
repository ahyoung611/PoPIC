import {useEffect, useState} from "react";

const MyPopic = ()=>{
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        fetch("/reservations/me") // 현재 로그인한 사용자 예약만
            .then(res => res.json())
            .then(data => setReservations(data));
    }, []);

    return (
        <div>
            <h2>내 예약 내역</h2>
            {reservations.map(r => (
                <div key={r.id}>
                    <p>주문번호: {r.orderId}</p>
                    <p>결제금액: {r.amount}</p>
                    <p>예약일: {r.date}</p>
                </div>
            ))}
        </div>
    );
}
export default MyPopic;