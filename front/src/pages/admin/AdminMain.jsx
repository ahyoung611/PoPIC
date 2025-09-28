import {useNavigate} from "react-router-dom";
import '../../style/adminMain.css';
import {useAuth} from "../../context/AuthContext.jsx";
import {useEffect} from "react";

const AdminMain = () => {
    const nav = useNavigate();
    const token = useAuth().getToken();
    const user = useAuth().getUser();

    // useEffect(() => {
    //     console.log(user);
    // },[token, user])

    // 주소창 admin 진입 방지
    useEffect(() => {
        if (!user || user.role !== "ADMIN") {
            nav("/login", { replace: true });
        }
        console.log(user);
    }, [token, user, nav]);

    if (!user || user.role !== "ADMIN") return null;

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