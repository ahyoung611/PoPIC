import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";

const FieldWaiting = ()=>{
    return(
        <div className={"container"}>
            <div className={"inner field-waiting"}>
                <h2>현장 관리</h2>
                <div className={"current-info"}>
                    <div className={"waiting-count"}>대기중 5팀</div>
                    <div className={"entry-count"}>금일 입장 3명</div>
                </div>
                <div className={"search-bar"}>
                    <Select
                        value={sort}
                        onChange={setSort}
                        options={[
                            { label: "전체", value: "" },
                            { label: "입장 완료", value: "entry" },
                            { label: "입장 완료", value: "complete" },
                            { label: "예약 취소", value: "cancel" },
                        ]}
                    />
                    <input type={"text"} onChange={(e)=>{setKeyword(e.target.value)}} placeholder={"예약자 이름 검색"}/>
                    <Button onClick={fetchReservation}>검색</Button>
                </div>
            </div>
        </div>
    )
}

export default FieldWaiting