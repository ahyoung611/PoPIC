import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
    statusLabelFromCode,
    statusCodeFromLabel,
    filterOptionsUser,
    manageOptions,
} from "../../utils/statusUtil.js";

const AdminUser = () => {
    const token = useAuth().getToken();
    const [sort, setSort] = useState("");
    const [keyword, setKeyword] = useState("");
    const [list, setList] = useState([]);

    const fetchUsers = async () => {
        const res = await apiRequest(
            `/admin/users?sort=${sort}&keyword=${encodeURIComponent(keyword)}`,
            { credentials: "include" },
            token
        );
        setList(res ?? []);
    };

    const changeStatus = async (id, newLabel) => {
        if (!newLabel) return;
        if (window.confirm(`${newLabel} 상태로 변경하시겠습니까?`)) {
            const code = statusCodeFromLabel(newLabel);
            await apiRequest(
                `/admin/user/status?id=${id}&status=${code}`,
                { method: "POST", credentials: "include" },
                token
            );
            fetchUsers();
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort, token]);

    return (
        <div className="container">
            <div className="inner admin-popup">
                <h1>회원 관리</h1>
                <div className="search-bar">
                    <Select value={sort} onChange={setSort} options={filterOptionsUser} />
                    <input
                        type="text"
                        placeholder="이름/아이디/이메일"
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchUsers();   // 엔터 입력 시 검색 실행
                            }
                        }}
                    />
                    <Button onClick={fetchUsers}>검색</Button>
                </div>

                <div className="list-table">
                    <table>
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>이름</th>
                            <th>아이디</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((u) => (
                            <tr key={u.user_id}>
                                <td>{u.user_id}</td>
                                <td>{u.name}</td>
                                <td>{u.login_id}</td>
                                <td>{u.email}</td>
                                <td>{u.phone_number}</td>
                                <td>{u.join_date && new Date(u.join_date).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={statusLabelFromCode(u.status)}
                                        onChange={(e) => changeStatus(u.user_id, e.target.value)}
                                    >
                                        {manageOptions.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={7}>조회 결과가 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUser;
