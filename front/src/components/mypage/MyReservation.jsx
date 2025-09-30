import {useEffect, useState} from "react";
import MyReservationModal from "./MyReservationModal.jsx";
import Button from "../commons/Button.jsx";
import {useNavigate} from "react-router-dom";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReservation = ({reservations, onUpdateReservation}) => {
    const nav = useNavigate();
    const [selected, setSelected] = useState(null);

    const formatStatus = (status) => {
        if (status === 1) {
            return "예약 완료";
        } else if (status === -1) {
            return "예약 취소";
        } else if (status === 0) {
            return "참여 완료";
        }
    }

    useEffect(() => {
        formatStatus();
    }, [reservations]);


    return (
        <div className="reservation-list">
            {reservations.map(r => {
                const imageId = r.popup?.images?.length > 0 ? r.popup.images[0] : null;
                const thumb = imageId
                    ? `${URL}/images?id=${imageId}&type=popup`
                    : "";

                return (
                    <div key={r.reservationId} className="reservation-card">
                        <div className={"title-box"} onClick={() => {
                            nav(`/popupStore/detail/${r.popup?.store_id}`);
                        }}>
                            <div className="thumb">
                                <img src={thumb} alt={r.popup?.store_name || "popup"}/>
                            </div>
                            <div className="info">
                                <div className="row">
                                    <div className="title">예약번호</div>
                                    <div className="content">{r.reservationId}</div>
                                </div>
                                <div className="row">
                                    <div className="title">예약 날짜</div>
                                    <div className="content">{r.slot?.schedule.date} {r.slot?.start_time}</div>
                                </div>
                                <div className="row">
                                    <div className="title">장소</div>
                                    <div className="content">{r.popup?.address} {r.popup?.address_detail}</div>
                                </div>
                                <div className="row">
                                    <div className="title">상태</div>
                                    <div className="content">{formatStatus(r.status)}</div>
                                </div>
                            </div>
                        </div>
                        <Button
                            className={"detail-btn"}
                            variant={"ghost"}
                            onClick={() => setSelected(r)}
                        >
                            주문상세 →
                        </Button>
                    </div>
                );
            })}
            <MyReservationModal
                open={!!selected}
                reservation={selected}
                onClose={() => setSelected(null)}
                onUpdateReservation={(id, newStatus) => {
                    const updated = reservations.map(r =>
                        r.reservationId === id ? { ...r, status: newStatus } : r
                    );
                    onUpdateReservation(updated);
                }}
            />
        </div>
    );
};
export default MyReservation;
