import Button from "../../components/commons/Button.jsx";

const VendorMain = () => {
    return (
        <div>
            {/* filter : 전체 | 패션 | 뷰티  */}
            <h3>filter : 전체 | 패션 | 뷰티</h3>
            <Button variant="filter" selected>전체</Button>
            <Button variant="filter">영화</Button><br/><br/>

            {/* primary : 현잘발권 | 검색 | 등록 | 수정 */}
            <h3>primary : 현잘발권 | 검색 | 등록 | 수정</h3>
            <Button variant="primary" color="red">현장 발권</Button><br/><br/>

            {/* outline : 등록 | 체크인 안함 | 체크인 */}
            <h3>outline : 등록 | 체크인 안함 | 체크인</h3>
            <Button variant="outline" color="gray">현장 발권</Button><br/><br/>

            {/* ghost : 상세보기 -> */}
            <h3>ghost : 상세보기 -></h3>
            <Button variant="ghost">상세보기 →</Button><br/><br/>

            {/* label : 승인대기 | 승인완료 | 승인거부 */}
            <h3>label : 승인대기 | 승인완료 | 승인거부</h3>
            <Button variant="label" color="gray">승인 대기</Button>
            <Button variant="label" color="blue">승인 완료</Button>
            <Button variant="label" color="red">승인 거부</Button>
        </div>
    );
};

export default VendorMain;
