const MyWalkIn = ({walkIn}) => {
    return (
        <div className="reservation-list">
            {walkIn.map(w => (
                <div key={w.id} className="reservation-card">
                    <div className="thumb">
                        <img src={w.imageUrl || "/default.jpg"} alt="walkin"/>
                    </div>
                    <div className="info">
                        <p><strong>대기번호</strong> {w.queueNumber}</p>
                        <p><strong>팝업명</strong> {w.storeName}</p>
                        <p><strong>장소</strong> {w.address} {w.addressDetail}</p>
                        <p><strong>상태</strong> 대기완료</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default MyWalkIn;
