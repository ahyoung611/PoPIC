const MyWalkIn = ({ walkIn, formatDateTime, formatStatus }) => {
    return (
        <div>
            <h3>대기 내역</h3>
            {walkIn
                .filter(w => w.status === 1)
                .map(w => (
                    <div key={w.id}>
                        <p>팝업명: {w.storeName}</p>
                        <p>팝업장소: {w.address} {w.address_detail}</p>
                        <p>대기 번호: {w.queueNumber}</p>
                        <p>신청 시간: {formatDateTime(w.createdAt)}</p>
                        <p>상태: {formatStatus(w.status)}</p>
                    </div>
                ))}
        </div>
    );
};

export default MyWalkIn;
