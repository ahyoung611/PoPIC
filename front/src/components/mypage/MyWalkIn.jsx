const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyWalkIn = ({walkIn}) => {
    return (
        <div className="reservation-list">
            {walkIn.map(w => {
                const imageId = r.popup?.images?.length > 0 ? r.popup.images[0] : null;
                const thumb = imageId
                    ? `${URL}/images?id=${imageId}&type=popup`
                    : "";

                return (
                    <div key={w.id} className="reservation-card">
                        <div className="thumb">
                            <img src={thumb} alt="walkin"/>
                        </div>
                        <div className="info">
                            <p><strong>대기번호</strong> {w.queueNumber}</p>
                            <p><strong>팝업명</strong> {w.storeName}</p>
                            <p><strong>장소</strong> {w.address} {w.addressDetail}</p>
                            <p><strong>상태</strong> 대기완료</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
export default MyWalkIn;
