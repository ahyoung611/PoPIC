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
                            <p><strong>대기번호</strong> {w.queueNumber}</p>
                            <p><strong>팝업명</strong> {storeName}</p>
                            <p><strong>장소</strong> {w.address} {w.addressDetail}</p>
                            <p><strong>상태</strong> {formatStatus(w.status)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MyWalkIn;
