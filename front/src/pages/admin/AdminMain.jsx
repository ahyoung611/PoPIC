import {useNavigate} from "react-router-dom";
import '../../style/adminMain.css';

const AdminMain = () => {
    const nav = useNavigate();

    return (
        <div className={"container"}>
            <div className={"inner admin-main"}>

                <div className={"popup-manage"} onClick={() => {nav("/admin/popupManage")}}>
                    <p>팝업 승인 | 반려</p>
                </div>

                <div className={"vendor-manage"} onClick={() => {nav("/admin/vendorManage")}}>
                    <p>팝업 운영자 관리</p>
                </div>

                <div className={"user-mange"} onClick={() => {nav("/admin/userManage")}}>
                    <p>회원 관리</p>
                </div>

            </div>
        </div>
    )
}
export default AdminMain;