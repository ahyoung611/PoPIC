import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
    statusLabelFromCode,
    statusCodeFromLabel,
    filterOptionsUser,
    manageOptions,
} from "../../utils/statusUtil.js";
import Pagination from "../../components/commons/Pagination.jsx";
import ConfirmModal from "../../components/commons/ConfirmModal.jsx";
import SearchHeader from "../../components/commons/SearchHeader.jsx";

const AdminUser = () => {
    const token = useAuth().getToken();
    const [sort, setSort] = useState("");
    const [keyword, setKeyword] = useState("");
    const [list, setList] = useState([]);

    // 상태 변경 모달
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState(null); // { id, newLabel }

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const fetchUsers = async (page = currentPage) => {
            const res = await apiRequest(
                    `/admin/users?sort=${sort}&keyword=${encodeURIComponent(keyword)}&page=${page - 1}&size=${pageSize}`,
                    { credentials: "include" },
                    token
                );
            const isArray = Array.isArray(res);
            setList(isArray ? res : (res?.content ?? []));
            setTotalPages(isArray ? 1 : (res?.totalPages ?? 1));
            setCurrentPage(isArray ? 1 : ((res?.number ?? 0) + 1));
        };

    // const changeStatus = async (id, newLabel) => {
    //     if (!newLabel) return;
    //     if (window.confirm(`${newLabel} 상태로 변경하시겠습니까?`)) {
    //         const code = statusCodeFromLabel(newLabel);
    //         await apiRequest(
    //             `/admin/user/status?id=${id}&status=${code}`,
    //             { method: "POST", credentials: "include" },
    //             token
    //         );
    //         fetchUsers();
    //     }
    // };
    const changeStatus = (id, newLabel) => {
            if (!newLabel) return;
            setPendingChange({ id, newLabel });
            setConfirmOpen(true);
        };

        const getConfirmTitle = (label) => {
            if (!label) return "상태를 변경하시겠습니까?";
            if (label.includes("정지")) return "정지하시겠습니까?";
            if (label.includes("비활성")) return "비활성화 하시겠습니까?";
            if (label.includes("활성")) return "활성화 하시겠습니까?";
            return `${label} 상태로 변경하시겠습니까?`;
        };

    useEffect(() => {
        fetchUsers(1); // 수정: sort/token 바뀔 때 1페이지부터
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort, token]);

    const manageOptionsNoSelect = manageOptions.filter((o) => o.value !== "선택"); // 수정

    const allowedUserCodes = new Set([0, 1]); // 정지, 정상만
    const userManageOptions = manageOptionsNoSelect.filter(
        (o) => allowedUserCodes.has(statusCodeFromLabel(o.value)) // 수정
    );

    return (
        <div className="container">
            <div className="inner admin-popup">
                <h1>회원 관리</h1>
                <div className="search-bar">
                    <Select value={sort} onChange={setSort} options={filterOptionsUser} />
                        <SearchHeader
                            searchValue={keyword}
                            onSearchChange={setKeyword}
                            onSearchClick={() => fetchUsers(1)}
                            placeholder="이름/아이디/이메일"
                            className=""
                            // showRegister={false}                       // 옵션
                        />
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
                                        {userManageOptions.map((o) => ( // 수정: 필터링된 옵션 사용
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
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

                {/* 상태 선택 모달 */}
                <ConfirmModal
                    open={confirmOpen}
                    title={getConfirmTitle(pendingChange?.newLabel)}
                    okText="네"
                    cancelText="아니오"
                    danger={/정지|비활성/.test(pendingChange?.newLabel || "")}
                    onConfirm={async () => {
                        if (!pendingChange) return;
                        const code = statusCodeFromLabel(pendingChange.newLabel);
                        await apiRequest(
                                `/admin/user/status?id=${pendingChange.id}&status=${code}`,
                                { method: "POST", credentials: "include" },
                                token
                            );
                        setConfirmOpen(false);
                        setPendingChange(null);
                        fetchUsers();
                    }}
                    onCancel={() => {
                        setConfirmOpen(false);
                        setPendingChange(null);
                    }}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => fetchUsers(p)}
                />

            </div>
        </div>
    );
};

export default AdminUser;
