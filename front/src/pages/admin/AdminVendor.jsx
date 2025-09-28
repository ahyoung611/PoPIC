import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
    statusLabelFromCode,
    statusCodeFromLabel,
    filterOptionsVendor,
    manageOptions,
} from "../../utils/statusUtil.js";
import Pagination from "../../components/commons/Pagination.jsx";
import ConfirmModal from "../../components/commons/ConfirmModal.jsx";

const AdminVendor = () => {
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

    const fetchVendors = async (page = currentPage) => {
            const res = await apiRequest(
                    `/admin/vendors?sort=${sort}&keyword=${encodeURIComponent(keyword)}&page=${page - 1}&size=${pageSize}`,
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
    //             `/admin/vendor/status?id=${id}&status=${code}`,
    //             { method: "POST", credentials: "include" },
    //             token
    //         );
    //         fetchVendors();
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
        fetchVendors(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort, token]);

    return (
        <div className="container">
            <div className="inner admin-popup">
                <h1>운영자 관리</h1>
                <div className="search-bar">
                    <Select value={sort} onChange={setSort} options={filterOptionsVendor} />
                    <input
                        type="text"
                        placeholder="업체명/담당자/아이디/사업자등록번호"
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchVendors(1);   // 엔터 입력 시 검색 실행
                            }
                        }}
                    />
                    <Button onClick={() => fetchVendors(1)}>검색</Button>
                </div>

                <div className="list-table">
                    <table>
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>업체명</th>
                            <th>담당자</th>
                            <th>아이디</th>
                            <th>연락처</th>
                            <th>사업자등록번호</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((v) => (
                            <tr key={v.vendor_id}>
                                <td>{v.vendor_id}</td>
                                <td>{v.vendor_name}</td>
                                <td>{v.manager_name}</td>
                                <td>{v.login_id}</td>
                                <td>{v.phone_number}</td>
                                <td>{v.brn}</td>
                                <td>{v.join_date && new Date(v.join_date).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={statusLabelFromCode(v.status)}
                                        onChange={(e) => changeStatus(v.vendor_id, e.target.value)}
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
                                <td colSpan={8}>조회 결과가 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 선택 확인 모달창 */}
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
                                `/admin/vendor/status?id=${pendingChange.id}&status=${code}`,
                                { method: "POST", credentials: "include" },
                                token
                            );
                        setConfirmOpen(false);
                        setPendingChange(null);
                        fetchVendors();
                    }}
                    onCancel={() => {
                        setConfirmOpen(false);
                        setPendingChange(null);
                    }}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => fetchVendors(p)}
                />

            </div>
        </div>
    );
};

export default AdminVendor;
