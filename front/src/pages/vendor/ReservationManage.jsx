import {useParams} from "react-router-dom";
import Select from "../../components/commons/Select.jsx";
import {useEffect, useState} from "react";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";

const ReservationManage = ()=>{
    const params = useParams();
    const [keyword, setKeyword] = useState("");
    const [sort, setSort] = useState("");
    const [reservationList, setReservationList] = useState([]);
    const popupId = params.popupId;

    const fetchReservation = async ()=>{
        const response = await apiRequest(`/vendor/reservationList?popupId=${popupId}&sort=${sort}`, {
            credentials: "include",
        });
        console.log(response);
        setReservationList(response);
    }

    useEffect(()=>{
        fetchReservation();
    },[sort])

    return(
        <div className={"container"}>
            <div className={"inner reservationManage"}>
                <h2>예약 관리</h2>
                <div className={"search-bar"}>
                    <Select
                        value={sort}
                        onChange={setSort}
                        options={[
                            { label: "전체", value: "" },
                            { label: "예약", value: "reservation" },
                            { label: "입장 완료", value: "complete" },
                            { label: "예약 취소", value: "cancel" },
                        ]}
                    />
                    <input type={"text"} onChange={(e)=>{setKeyword(e.target.value)}} placeholder={"예약자 이름 검색"}/>
                    <Button onClick={fetchReservation}>검색</Button>
                </div>

                <div className={"list-table"}>
                    <table>
                        <thead>
                            <tr>
                                <th>예약 번호</th>
                                <th>예약자 명</th>
                                <th>인원</th>
                                <th>예약 시간</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                        {reservationList.map((item, index)=>(
                            <tr key={index}>
                                <td>{item.reservationId}</td>
                                <td>{item.user.name}</td>
                                <td>{item.reservationCount}</td>
                                <td>{item.slot.start_time}</td>
                                <td>
                                    <Button variant={"label"} color={
                                        item.status === 0
                                                ? "red"
                                                : item.status === 1
                                                    ? "blue"
                                                    : "gray"
                                    }>
                                        {item.status === 0
                                            ? "입장 완료"
                                            : item.status === 1
                                                ? "예약 완료"
                                                : "예약 취소"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

export default ReservationManage;