import Button from "../../components/commons/Button.jsx";

const VendorMain = () => {
    return (
        <div>
            {/* 필터 버튼 */}
            <Button variant="filter" selected>전체</Button>
            <Button variant="filter">영화</Button>

            {/* 액션 버튼 */}
            <Button variant="primary" color="red">현장 발권</Button>
            <Button variant="outline" color="gray">현장 발권</Button>
            <Button variant="ghost">주문상세 →</Button>

            {/* 상태 라벨 */}
            <Button variant="label" color="gray">승인 대기</Button>
            <Button variant="label" color="blue">승인 완료</Button>
            <Button variant="label" color="red">승인 거부</Button>
        </div>
    );
};

export default VendorMain;
