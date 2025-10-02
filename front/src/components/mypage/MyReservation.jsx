import { useState } from "react";
import MyReservationModal from "./MyReservationModal.jsx";
import Button from "../commons/Button.jsx";
import { useNavigate } from "react-router-dom";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const ICONS = {
  pin: "/favicon.png",
  check: "/privateCheck-p.png",
  clock: "/privateCheck-gp.png",
  cancel: "/privateCheck-g.png",
};

function formatDateDot(dateInput) {
  if (!dateInput) return "";
  const s = String(dateInput).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.replaceAll("-", ".");

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatTimeHHMM(timeInput) {
  if (!timeInput) return "";
  const s = String(timeInput).trim();

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    return s.split(":").slice(0, 2).join(":"); // 초 잘라냄
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return s;
}

const MyReservation = ({
  reservations = [],
  onUpdateReservation,
}) => {
  const nav = useNavigate();
  const [selected, setSelected] = useState(null);

  const formatStatus = (status) => {
    if (status === 1) return "예약 완료";
    if (status === 0) return "참여 완료";
    if (status === -1) return "예약 취소";
    return "";
  };

  const statusIcon = (status) => {
    if (status === 1) return ICONS.clock;   // 진행 전
    if (status === 0) return ICONS.check;   // 참여 완료
    if (status === -1) return ICONS.cancel; // 취소
    return ICONS.clock;
  };

  const hasItems = Array.isArray(reservations) && reservations.some((x) => x && typeof x === "object");

  return (
    <>
      <ul className="reservation-list" role="list">
        {!hasItems ? (
          <li className="board-empty">예약 내역이 없습니다.</li>
        ) : (
          reservations.map((r) => {
            const imageId = r?.popup?.images?.[0];
            const thumb = imageId ? `${URL}/images?id=${imageId}&type=popup` : "";
            const storeName = r?.popup?.store_name ?? "팝업";

            const dateStr = formatDateDot(r?.slot?.schedule?.date);
            const timeStr = formatTimeHHMM(r?.slot?.start_time);

            return (
              <li key={r?.reservationId} className="reservation-card card">
                <div
                  className="card-main"
                  onClick={() => nav(`/popupStore/detail/${r?.popup?.store_id}`)}
                >
                  <div className="thumb">
                    {thumb && <img src={thumb} alt={storeName} />}
                  </div>

                  <div className="meta">
                    <div className="meta-row meta-bold">
                      <span>예약번호</span>
                      <span>{r?.reservationId}</span>
                    </div>

                    <div className="meta-row">
                      <span className="only-text">
                        {dateStr} {timeStr}
                      </span>
                    </div>

                    <div className="meta-row">
                      <img className="icon" src={ICONS.pin} alt="" />
                      <span>
                        {r?.popup?.address} {r?.popup?.address_detail}
                      </span>
                    </div>

                    <div className="meta-row">
                      <img className="icon" src={statusIcon(r?.status)} alt="" />
                      <span className="status-text">{formatStatus(r?.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="btn-box">
                  <Button variant="ghost" onClick={() => setSelected(r)}>
                    주문 상세보기 &gt;
                  </Button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <MyReservationModal
        open={!!selected}
        reservation={selected}
        onClose={() => setSelected(null)}
        onUpdateReservation={(id, newStatus) => {
          const updated = (reservations || []).map((r) =>
            r?.reservationId === id ? { ...r, status: newStatus } : r
          );
          onUpdateReservation?.(updated);
        }}
      />
    </>
  );
};

export default MyReservation;
