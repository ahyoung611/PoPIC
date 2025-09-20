import Select from "../../components/commons/Select.jsx";
import {useEffect, useRef, useState} from "react";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import PopupDetailModal from "./PopupDetailModal.jsx";
import '../../style/adminPopup.css';

const AdminPopup = () => {
    const [popupList, setPopupList] = useState([]);
    const [sort, setSort] = useState("");
    const keyword = useRef("");
    const [modal, setModal] = useState(false);
    const [selected, setSelected] = useState(null);


    const fetchPopup = async () => {
        const response = await apiRequest(`/admin/popup?sort=`+sort, {
            credentials: "include",
        });
        setPopupList(response);
        console.log(response);
    }

    const fetchPopupStatus = async (storeId,statusCode) => {
        const response = await apiRequest(`/admin/popupConfirm?popupId=${storeId}&statusCode=${statusCode}`, {
            credentials: "include",
        });
    }

    const changePopupStatus = async (storeId,newStatus)=>{
        if(window.confirm(newStatus+ " 상태로 변경 하시겠습니까?")){
            let statusCode;
            switch (newStatus) {
                case "활성":
                    statusCode = 1;
                    break;
                case "비활성":
                    statusCode = -1;
                    break;
                default:
                    statusCode = 2;
            }
            await fetchPopupStatus(storeId,statusCode);
            fetchPopup();
        }
    }

    useEffect(() => {
        fetchPopup();
    },[sort])

    const adminPopupDetail = (popup)=>{
        setSelected(popup);
        setModal(true);
    }


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
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>팝업명</th>
                                <th>담당자</th>
                                <th>전화번호</th>
                                <th>등록날짜</th>
                                <th>관리</th>
                                <th>상세보기</th>
                            </tr>
                        </thead>
                        <tbody>
                        {popupList.map((item, index) => (
                            <tr key={index}>
                                <td>{item.store_id}</td>
                                <td>{item.store_name}</td>
                                <td>{item.vendor.manager_name}</td>
                                <td>{item.vendor.phone_number}</td>
                                <td>{new Date(item.join_date).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={
                                            item.status === 2
                                                ? "선택"
                                                : item.status === 1
                                                    ? "활성"
                                                    : "비활성"
                                        }
                                        onChange={(e) => changePopupStatus(item.store_id, e.target.value)}
                                    >
                                        <option value="선택">선택</option>
                                        <option value="활성">활성</option>
                                        <option value="비활성">비활성</option>
                                    </select>
                                </td>
                                <td>
                                    <Button onClick={()=>{adminPopupDetail(item)}} variant={"ghost"} color={"gray"}>
                                        상세보기
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <PopupDetailModal popup={selected} isOpen={modal} onClose={()=>{setModal(false)}} />
            </div>
        </div>
    )
}
export default AdminPopup;