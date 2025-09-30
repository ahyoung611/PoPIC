import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import ConfirmModal from "../../components/commons/ConfirmModal.jsx";
import { filterOptionsVendor,  manageOptionsVendor, vendorStatusLabelFromCode, vendorStatusCodeFromLabel } from "../../utils/statusUtil.js";
import SearchHeader from "../../components/commons/SearchHeader.jsx";

const AdminVendor = () => {
    const token = useAuth().getToken();
    const [sort, setSort] = useState("");
    const [keyword, setKeyword] = useState("");
    const [list, setList] = useState([]);

    // 상태 변경 모달
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState(null);

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    // select value 값 매핑(가입 반려 → 승인 반려)
    const mapFilterToServer = (v) => {
        const s = String(v ?? "");
        if (s === "") return { sort: "", status: null };

        // 숫자코드("2","1","0","3")가 들어온 경우 -> 서버 sort 문자열도 함께 생성
        if (/^\d+$/.test(s)) {
            const status = Number(s);
            const sort =
                status === 2 ? "pending" :
                    status === 1 ? "normal"  :
                        status === 0 ? "blocked" :
                            status === 3 ? "rejected" : "";
            return { sort, status };
        }

        // 문자열(pending/normal/blocked/rejected)이 들어온 경우 -> status 정수도 함께 생성
        const toStatus = { pending: 2, normal: 1, blocked: 0, rejected: 3 };
        return { sort: s, status: toStatus[s] ?? null };
    };

    const fetchVendors = async (page = currentPage) => {
/*            const res = await apiRequest(
                    `/admin/vendors?sort=${sort}&keyword=${encodeURIComponent(keyword)}&page=${page - 1}&size=${pageSize}`,
                    { credentials: "include" },
                    token
                );*/
            const params = new URLSearchParams();
            if (keyword) params.set("keyword", keyword);
            params.set("page", String(page - 1));
            params.set("size", String(pageSize));

            if (sort !== "") {
                const { sort: sortParam, status } = mapFilterToServer(sort);
                if (sortParam) params.set("sort", sortParam);
                if (status !== null) params.set("status", String(status));
            }

            const res = await apiRequest(
                  `/admin/vendors?${params.toString()}`,
                  { credentials: "include" },
                  token
                );

            const isArray = Array.isArray(res);
            setList(isArray ? res : (res?.content ?? []));
            setTotalPages(isArray ? 1 : (res?.totalPages ?? 1));
            setCurrentPage(isArray ? 1 : ((res?.number ?? 0) + 1));
        };

    const changeStatus = (id, code) => {
        if (code === undefined || code === null) return;
        setPendingChange({ id, code }); // 수정
        setConfirmOpen(true);
    };

    const getConfirmTitle = (code) => {
        switch (Number(code)) {
            case 0: return "정지하시겠습니까?";
            case 1: return "정상으로 변경하시겠습니까?";
            case 2: return "승인대기로 변경하시겠습니까?";
            case 3: return "승인을 반려하시겠습니까?";
            default: return "상태를 변경하시겠습니까?";
        }
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
                    <SearchHeader
                        searchValue={keyword}
                        onSearchChange={setKeyword}
                        onSearchClick={() => fetchVendors(1)}
                        placeholder="업체명/담당자/아이디/사업자등록번호"
                        className=""
                    />
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
{/*                        {list.map((v) => (
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
                                        value={String(v.status)}
                                        onChange={(e) => changeStatus(
                                            v.vendor_id,
                                            Number(e.target.value)
                                        )}
                                    >
                                        {VENDOR_STATUS_OPTIONS.map((o) => (
                                            <option key={o.code} value={String(o.code)}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    {Number(v.status) === -1 ? (
                                        <span className="text-gray-500">탈퇴</span>
                                    ) : (
                                        <select
                                            value={vendorStatusLabelFromCode(v.status)} // 코드→라벨
                                            onChange={(e) =>
                                                changeStatus(
                                                    v.vendor_id,
                                                    vendorStatusCodeFromLabel(e.target.value) // 라벨→코드
                                                )
                                            }
                                        >
                                            {manageOptionsVendor.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}*/}
                        {list.map((v) => {
                            // 현재 상태를 라벨로 변환 (예: 2 -> "승인 대기")
                            const currentLabel = vendorStatusLabelFromCode(v.status);
                            // 혹시 모를 안전장치: 옵션에 없는 라벨이면 "승인 대기"로 고정
                            const selectValue = manageOptionsVendor.some(o => o.label === currentLabel)
                                ? currentLabel
                                : "승인 대기";

                            return (
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
                                            value={selectValue}
                                            onChange={(e) =>
                                                changeStatus(
                                                    v.vendor_id,
                                                    vendorStatusCodeFromLabel(e.target.value)
                                                )
                                            }
                                        >
                                            {manageOptionsVendor.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
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
                    // title={getConfirmTitle(pendingChange?.newLabel)}
                    title={getConfirmTitle(pendingChange?.code)}
                    okText="네"
                    cancelText="아니오"
                    // danger={/정지|비활성|반려/.test(pendingChange?.newLabel || "")}
                    danger={[0, 3].includes(Number(pendingChange?.code || -999))}
                    onConfirm={async () => {
                        if (!pendingChange) return;
                        await apiRequest(
                            `/admin/vendor/status?id=${pendingChange.id}&status=${pendingChange.code}`,
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
