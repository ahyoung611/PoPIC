import Select from "../../components/commons/Select.jsx";
import {useEffect, useRef, useState} from "react";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";

const AdminPopup = () => {
    const [popupList, setPopupList] = useState([]);
    const [sort, setSort] = useState("");
    const keyword = useRef("");



    useEffect(() => {
        const fetchPopup = async () => {
            const response = await apiRequest(`/admin/popup`, {
                credentials: "include",
            });
            setPopupList(response);
            console.log(response);
        }
        fetchPopup();
    },[])


    return (
        <div className={"container"}>
            <div className={"inner admin-popup"}>
                <h1>팝업스토어 관리</h1>
                <div className={"search-bar"}>
                    <Select
                        value={sort}
                        onChange={setSort}
                        options={[
                            { label: "선택", value: "" },
                            { label: "승인", value: "approved" },
                            { label: "반려", value: "rejected" },
                        ]}
                    />
                    <input type={"text"} ref={keyword} placeholder={"승인대기 팝업 검색"}/>
                    <Button>검색</Button>
                </div>
                <div className={"list-table"}>
                    <table>

                        <tr>
                            <th>번호</th>
                            <th>팝업명</th>
                            <th>담당자</th>
                            <th>전화번호</th>
                            <th>등록날짜</th>
                            <th>관리</th>
                            <th>상세보기</th>
                        </tr>
                        {popupList.map((item, index) => (
                            <tr key={index}>
                                <td>{item.store_id}</td>
                                <td>{item.store_name}</td>
                                <td>{item.store_name}</td>
                                <td>010-----</td>
                                <td>{new Date(item.join_date).toLocaleDateString()}</td>
                                <td>관리버튼</td>
                                <td>상세보기 버튼</td>
                            </tr>

                        ))}
                    </table>
                </div>
            </div>
        </div>
    )
}
export default AdminPopup;