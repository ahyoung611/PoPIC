import {useEffect, useState} from "react";
import MyReservationModal from "./MyReservationModal.jsx";
import Button from "../commons/Button.jsx";
import {useNavigate} from "react-router-dom";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const ICONS = {
  pin: "/favicon.png",
  check: "/privateCheck-p.png",
  clock: "/privateCheck-g.png",
  cancel: "/privateCheck-g.png",
};

const MyReservation = ({ reservations, onUpdateReservation }) => {
  const nav = useNavigate();
  const [selected, setSelected] = useState(null);

  const formatStatus = (status) => {
    if (status === 1) return "예약 완료";
    if (status === 0) return "참여 완료";
    if (status === -1) return "예약 취소";
    return "";
  };

  // 상태별 아이콘 매핑
  const statusIcon = (status) => {
    if (status === 1) return ICONS.clock;
    if (status === 0) return ICONS.check;
    if (status === -1) return ICONS.cancel;
    return ICONS.clock;
  };

  return (
    <div className="reservation-list">
      {reservations.map((r) => {
        const imageId = r.popup?.images?.[0];
        const thumb = imageId ? `${URL}/images?id=${imageId}&type=popup` : "";
        const storeName = r.popup?.store_name ?? "팝업";

        return (
          <div key={r.reservationId} className="reservation-card card">
            <div
              className="card-main"
              onClick={() => nav(`/popupStore/detail/${r.popup?.store_id}`)}
            >
              <div className="thumb">
                {thumb && <img src={thumb} alt={storeName} />}
              </div>

                <div className="meta">
                <div className="meta-row meta-bold">
                    <span>예약번호</span>
                    <span>{r.reservationId}</span>
                  </div>
                  {/* 날짜: 아이콘 없이 텍스트만 */}
                  <div className="meta-row">
                    <span className="only-text">
                      {r.slot?.schedule.date} {r.slot?.start_time}
                    </span>
                  </div>

                  {/* 주소: 핀 아이콘 + 텍스트 */}
                  <div className="meta-row">
                    <img className="icon" src={ICONS.pin} alt="" />
                    <span>{r.popup?.address} {r.popup?.address_detail}</span>
                  </div>

                  {/* 상태: 아이콘 + 텍스트(참여완료/예약완료/예약취소) */}
                  <div className="meta-row">
                    <img className="icon" src={statusIcon(r.status)} alt="" />
                    <span className="status-text">{formatStatus(r.status)}</span>
                  </div>
                </div>
              </div>

            <div className="btn-box">
              <Button variant="ghost" onClick={() => setSelected(r)}>
                주문 상세보기 &gt;
              </Button>
            </div>
          </div>
        );
      })}

      <MyReservationModal
        open={!!selected}
        reservation={selected}
        onClose={() => setSelected(null)}
        onUpdateReservation={(id, newStatus) => {
          const updated = reservations.map((r) =>
            r.reservationId === id ? { ...r, status: newStatus } : r
          );
          onUpdateReservation(updated);
        }}
      />
    </div>
  );
};

export default MyReservation;
