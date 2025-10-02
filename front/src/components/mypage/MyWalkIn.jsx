import { useNavigate } from "react-router-dom";
import Button from "../commons/Button.jsx";
import OnsiteTicket from "../../pages/user/OnsiteTicket.jsx";
import {useState} from "react";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const ICONS = {
  pin: "/favicon.png",
  check: "/privateCheck-p.png",
  clock: "/privateCheck-g.png",
  cancel: "/privateCheck-g.png",
};

// (내용 유지) 상태 텍스트
const statusText = (w) => {

  if (w.status === 1){
      if(w.callTime){
          return "호출 완료";
      }
      return "대기 중";
  }

  if (w.status === 0) return "참여 완료";
  if (w.status === -1) return "대기 취소";
  return "";
};

// (내용 유지) 상태 아이콘
const statusIcon = (status) => {
  if (status === 1) return ICONS.clock;   // 대기 중
  if (status === 0) return ICONS.check;   // 참여 완료
  if (status === -1) return ICONS.cancel; // 대기 취소
  return ICONS.clock;
};

const MyWalkIn = ({ walkIn = [] }) => {
  const nav = useNavigate();

    const [selected, setSelected] = useState(null);
    const openDetail = (w) => setSelected(w);
    const closeDetail = () => setSelected(null);

  const goWalkInPage = (w) => {
    const popupName = w.popup?.name ?? w.storeName ?? "팝업";
    navigate(`/me/walkIn/${w.id}?storeId=${w.storeId}&popupName=${popupName}`);
  };

  return (
    <div className="reservation-list">
      {walkIn.map((w) => {
        const imageId = w.popup?.images?.[0];
        const thumb = imageId ? `${URL}/images?id=${imageId}&type=popup` : "";
        const storeName = w.popup?.storeName ?? w.storeName;

        return (
          <div key={w.id} className="reservation-card card">
            <div className="card-main" onClick={() => nav(`/popupStore/detail/${w.popup?.store_id}`)} >
              <div className="thumb">
                {thumb && <img src={thumb} alt={storeName} />}
              </div>

              <div className="meta">
                {/* 팝업명 */}
                <div className="meta-row meta-bold">
                  <span>{storeName}</span>
                </div>

                {/* 현장발권 날짜 */}
                <div className="meta-row">
                    <span >현장대기 날짜 입력</span>
                </div>

                {/* 주소 */}
                <div className="meta-row">
                  <img className="icon" src={ICONS.pin} alt="" />
                  <span>
                    {w.address} {w.addressDetail}
                  </span>
                </div>

                {/* 상태 */}
                <div className="meta-row">
                  <img className="icon" src={statusIcon(w.status)} alt="" />
                  <span className="status-text">{statusText(w)}</span>
                </div>
              </div>
            </div>

            <div className="btn-box">
                {w.status !== 0 && (
                    <Button
                        className="detail-btn"
                        variant="ghost"
                        onClick={() => openDetail(w)}
                    >
                        대기 상세보기 &gt;
                    </Button>
                )}
            </div>
          </div>
        );
      })}
        {selected && (
            <OnsiteTicket
                waitingId={selected.id}
                storeId={selected.storeId}
                popupName={selected.popup?.name}
                close={closeDetail}
            />
        )}
    </div>
  );
};

export default MyWalkIn;
