import {useNavigate} from "react-router-dom";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyWalkIn = ({walkIn = []}) => {
    const navigate = useNavigate();

    const goWalkInPage = (w) => {
        const popupName = w.popup?.name ?? w.storeName ?? "팝업";
        navigate(`/me/walkIn/${w.id}?storeId=${w.storeId}&popupName=${popupName}`);
    };

    const formatStatus = (status) => {
        if (status === 1) {
            return "대기 중";
        } else if (status === -1) {
            return "대기 취소";
        } else if (status === 0) {
            return "참여 완료";
        }
    }

    return (
        <div className="reservation-list">
            {walkIn.map((w) => {
                const imageId = w.popup?.images?.length > 0 ? w.popup.images[0] : null;
                const thumb = imageId ? `${URL}/images?id=${imageId}&type=popup` : "";
                const storeName = w.popup?.storeName ?? w.storeName;

                return (
                    <div
                        key={w.id}
                        className="reservation-card"
                        onClick={() => goWalkInPage(w)}
                        role="button"
                    >
                        <div className="thumb">
                            {thumb ? (
                                <img
                                    src={thumb}
                                    alt={storeName || "popup"}
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                            ) : null}
                        </div>
                        <div className="info">
                            <div className="row">
                                <div className="title">대기번호</div>
                                <div className="content">{w.queueNumber}</div>
                            </div>
                            <div className="row">
                                <div className="title">팝업명</div>
                                <div className="content">{storeName}</div>
                            </div>
                            <div className="row">
                                <div className="title">장소</div>
                                <div className="content">{w.address} {w.addressDetail}</div>
                            </div>
                            <div className="row">
                                <div className="title">상태</div>
                                <div className="content">{formatStatus(w.status)}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MyWalkIn;
