import {useState} from "react";

const AdminMain = () => {
    const [adminPage, setAdminPage] = useState("");

    return (
        <div className={"container"}>
            <div className={"inner admin-main"}>
                <div className={"popup-manage"}>

                </div>
                <div className={"vendor-manage"}></div>
                <div className={"user-mange"}></div>
            </div>
        </div>
    )
}
export default AdminMain;