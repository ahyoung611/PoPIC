import {useParams} from "react-router-dom";
import Select from "../../components/commons/Select.jsx";
import {useEffect, useState} from "react";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx";
import '../../style/reservationManage.css';

const ReservationManage = ()=>{
    const params = useParams();
    const [keyword, setKeyword] = useState("");
    const [sort, setSort] = useState("");
    const [reservationList, setReservationList] = useState([]);
    const vendorId = params.vendorId;
    const token = useAuth().getToken();

    const fetchReservation = async ()=>{
        const response = await apiRequest(`/vendor/reservationList?vendorId=${vendorId}&sort=${sort}&keyword=${keyword}`, {
            credentials: "include",
        }, token);
        console.log(response);
        setReservationList(response);
    }

    useEffect(()=>{
        fetchReservation();
    },[sort, token])

    return(
        <div className={"container"}>
            <div className={"inner reservationManage"}>
                <p className={"title"}>예약 관리</p>
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
                                <td>{item.slot.schedule.date} {item.slot.start_time}</td>
                                <td>
                                    <p>
                                        {item.status === 0
                                            ? "입장 완료"
                                            : item.status === 1
                                                ? "예약 완료"
                                                : "예약 취소"}
                                    </p>
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