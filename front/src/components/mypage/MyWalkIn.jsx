import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../commons/Button.jsx";
import OnsiteTicket from "../../pages/user/OnsiteTicket.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const ICONS = {
  pin: "/favicon.png",
  check: "/privateCheck-p.png",
  clock: "/privateCheck-g.png",
  cancel: "/privateCheck-g.png",
  called: "/privateCheck-gp.png",
};

function formatDateTime(input) {
  if (!input) return "";
  let s = String(input).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T00:00:00";

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(input);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  const hadTime = /\d{2}:\d{2}/.test(s) || /T\d{2}:\d{2}/.test(s);
  return hadTime ? `${y}.${m}.${day} ${hh}:${mm}` : `${y}.${m}.${day}`;
}

function pickWalkInDate(w) {
  const candidates = [
    w?.waitingAt,                          // 대기 생성 시각
    w?.waitDateTime,                       // 대기 일시(문자열)
    w?.waitDate,                           // 'YYYY-MM-DD'
    (w?.slot?.schedule?.date && w?.slot?.start_time)
      ? `${w.slot.schedule.date} ${w.slot.start_time}`
      : null,                              // 예약 슬롯 기반
    w?.ticket?.issuedAt,                   // 발권/티켓 생성 시각
    w?.callTime,                           // 호출된 시각
    w?.createdAt ?? w?.created_at,         // 레코드 생성 시각
    w?.updatedAt ?? w?.updated_at,         // 레코드 수정 시각
  ].filter(Boolean);

  return candidates[0] || "";
}

// 상태 텍스트
const statusText = (w) => {
  if (w?.status === 1) return w?.callTime ? "호출 완료" : "대기 중";
  if (w?.status === 0) return "참여 완료";
  if (w?.status === -1) return "대기 취소";
  return "";
};

// 상태 아이콘
const statusIcon = (w) => {
  if (w?.status === 1) return w?.callTime ? ICONS.called : ICONS.clock;
  if (w?.status === 0) return ICONS.check;
  if (w?.status === -1) return ICONS.cancel;
  return ICONS.clock;
};

const MyWalkIn = ({ walkIn = [] }) => {
  const nav = useNavigate();
  const [selected, setSelected] = useState(null);

  const hasItems = Array.isArray(walkIn) && walkIn.some((x) => x && typeof x === "object");

  const openDetail = (w) => setSelected(w);
  const closeDetail = () => setSelected(null);

  return (
    <>
      <ul className="reservation-list" role="list">
        {!hasItems ? (
          <li className="board-empty">현장 대기 내역이 없습니다.</li>
        ) : (
          walkIn.map((w) => {
            const imageId = w?.popup?.images?.[0];
            const thumb = imageId ? `${URL}/images?id=${imageId}&type=popup` : "";
            const storeName = w?.popup?.storeName ?? w?.storeName ?? "팝업";

            const waitWhen = formatDateTime(pickWalkInDate(w));

            return (
              <li key={w?.id} className="reservation-card card">
                <div
                  className="card-main"
                  onClick={() => nav(`/popupStore/detail/${w?.popup?.store_id}`)}
                >
                  <div className="thumb">
                    {thumb && <img src={thumb} alt={storeName} />}
                  </div>

                  <div className="meta">
                    <div className="meta-row meta-bold">
                      <span>{storeName}</span>
                    </div>

                    <div className="meta-row">
                      <span className="only-text">
                        {waitWhen || "대기 일시 정보 없음"}
                      </span>
                    </div>

                    <div className="meta-row">
                      <img className="icon" src={ICONS.pin} alt="" />
                      <span>{w?.address} {w?.addressDetail}</span>
                    </div>

                    <div className="meta-row">
                      <img className="icon" src={statusIcon(w)} alt="" />
                      <span className="status-text">{statusText(w)}</span>
                    </div>
                  </div>
                </div>

                <div className="btn-box">
                  {w?.status === 1 && (
                    <Button
                      className="detail-btn"
                      variant="ghost"
                      onClick={() => openDetail(w)}
                    >
                      상세보기 &gt;
                    </Button>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      {selected && (
        <OnsiteTicket
          waitingId={selected.id}
          storeId={selected.storeId}
          popupName={selected.popup?.name}
          close={closeDetail}
        />
      )}
    </>
  );
};

export default MyWalkIn;
