import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import {useEffect, useState} from "react";
import '../../style/fieldWaiting.css';
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx";

const FieldWaiting = ()=>{
    const [sort, setSort] = useState("");
    const [filedWaitingList, setFiledWaitingList] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [currentWaiting, setCurrentWaiting] = useState({});
    const user = useAuth().getUser();
    const token = useAuth().getToken();

    const fetchList = async () => {
        const response = await apiRequest(`/vendor/fieldWaitingList?vendorId=${user.vendor_id}&sort=${sort}&keyword=${keyword}`,{},token);
        setFiledWaitingList(response);
    }

    const fetchCurrentWaiting = async () => {
        const response = await apiRequest(`/vendor/fieldWaitingList?vendorId=${user.vendor_id}`, {}, token);
        const waitingNum = response.filter(item => item.status === 1).length;
        const entryNum = response.filter(item => item.status === 0).length;
        setCurrentWaiting({ waitingNum, entryNum });
    }



    const waitingCall = async (item)=>{
        if(!window.confirm("호출 하시겠습니까?")) return;

        const fetchCall = async () => {
            const response = await apiRequest(`/vendor/waitingCall?id=${item.id}`,{
                method: "PUT",
            },token);
        }
        await fetchCall();
        fetchList();
        alert("호출을 완료했습니다.");
    }

    const waitingEntry = async (item)=>{
        if(!window.confirm("입장 처리 하시겠습니까?")) return;

        const fetchEntry = async () => {
            const response = await apiRequest(`/vendor/waitingEntry?id=${item.id}`,{
                method: "PUT",
            },token);
        }
        await fetchEntry();
        fetchList();
        alert("입장 처리를 완료했습니다.");
    }

    const waitingCancel = async (item)=>{
        if(!window.confirm("취소 처리 하시겠습니까?")) return;

        const fetchCancel = async () => {
            const response = await apiRequest(`/vendor/waitingCancel?id=${item.id}`,{
                method: "PUT",
            },token);
        }
        await fetchCancel();
        fetchList();
        alert("취소 처리를 완료했습니다.");
    }

    useEffect(() => {
        fetchList();
        fetchCurrentWaiting();
    },[token, sort])


    return(
        <div className={"container"}>
            <div className={"inner field-waiting"}>
                <p className={"title"}>현장 관리</p>
                <div className={"current-info"}>
                    <div className={"waiting-count"}><div>대기중</div>
                    <div>
                        <span className={"point-color"}>{currentWaiting.waitingNum}</span>팀
                    </div>
                </div>
                    <div className={"entry-count"}>
                        <div>금일 입장</div>
                        <div>
                            <span className={"point-color"}>{currentWaiting.entryNum}</span>명
                        </div>
                    </div>
                </div>
                <div className={"search-bar"}>
                    <Select
                        value={sort}
                        onChange={setSort}
                        options={[
                            { label: "전체", value: "" },
                            { label: "입장 완료", value: "entry" },
                            { label: "예약 취소", value: "cancel" },
                        ]}
                    />
                    <input type={"text"} value={keyword} onChange={(e)=>{setKeyword(e.target.value)}} placeholder={"예약자 이름 검색"}/>
                    <Button onClick={fetchList}>검색</Button>
                </div>
                <div className={"list-table"}>
                    <table>
                        <thead>
                        <tr>
                            <th>대기 번호</th>
                            <th>예약자 명</th>
                            <th>호출 시간</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filedWaitingList.map((item, index)=>(
                            <tr key={index}>
                                <td>{item.queueNumber}</td>
                                <td>{item.user.name}</td>
                                <td>{item.callTime ? (new Date(item.callTime).toLocaleTimeString()) : ("아직 호출하지 않았습니다.")}</td>
                                <td>
                                    <p>
                                        {item.status === 0
                                            ? "입장 완료"
                                            : item.status === 1
                                                ? "대기중"
                                                : "대기 취소"}
                                    </p>
                                </td>
                                <td>
                                    {item.callTime ? (
                                        item.status !== -1 && (
                                            <>
                                                <button className={"btn"} onClick={()=>{waitingEntry(item)}}>입장 완료</button>|
                                                <button className={"btn"} onClick={()=>{waitingCancel(item)}}>취소</button>
                                            </>
                                        )
                                    ) : (
                                        <button className={"btn"} onClick={()=>{waitingCall(item)}}>
                                            호출하기
                                        </button>
                                    )}

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

export default FieldWaiting