const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReservation = ({reservations}) => {
    return (
        <div className="reservation-list">
            {reservations.map(r => {
                const imageId = r.popup?.images?.length > 0 ? r.popup.images[0] : null;
                const thumb = imageId
                    ? `${URL}/images?id=${imageId}&type=popup`
                    : "";

                return (
                    <div key={r.reservationId} className="reservation-card">
                        <div className="thumb">
                            <img src={thumb} alt={r.popup?.store_name || "popup"} />
                        </div>
                        <div className="info">
                            <p><strong>예약번호</strong> {r.reservationId}</p>
                            <p><strong>예매일</strong> {r.slot?.start_time}</p>
                            <p><strong>장소</strong> {r.popup?.address} {r.popup?.address_detail}</p>
                            <p><strong>상태</strong> 예약완료</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default MyReservation;
