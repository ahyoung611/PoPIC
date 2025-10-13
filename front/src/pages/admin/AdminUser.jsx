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

import "../../style/table.css";

const PAGE_SIZE = 10;

const toInt = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function AdminUser() {
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
  const [totalElements, setTotalElements] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchUsers = async (page = 1) => {
    const res = await apiRequest(
      `/admin/users?sort=${encodeURIComponent(sort)}&keyword=${encodeURIComponent(
        keyword
      )}&page=${page - 1}&size=${PAGE_SIZE}`,
      { credentials: "include" },
      token
    );

    const isArray = Array.isArray(res);
    const fullList = isArray ? res : (res?.content ?? []);

    // 배열로만 오면 프론트에서 페이지 분할
    const start = (page - 1) * PAGE_SIZE;
    const pageList = isArray ? fullList.slice(start, start + PAGE_SIZE) : fullList;
    setList(pageList);

    // 전체 개수
    const total =
      toInt(res?.totalElements) ??
      toInt(res?.total) ??
      toInt(res?.totalCount) ??
      toInt(res?.count) ??
      fullList.length;
    setTotalElements(total);

    // 총 페이지
    const pagesFromServer = toInt(res?.totalPages);
    const pages = pagesFromServer ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
    setTotalPages(pages);

    setCurrentPage(page);

    const nextByFlags =
      (typeof res?.last === "boolean" ? res.last === false : null) ??
      (typeof res?.hasNext === "boolean" ? !!res.hasNext : null) ??
      (typeof res?.hasMore === "boolean" ? !!res.hasMore : null);
    const hasNextByTotal = total > page * PAGE_SIZE;
    setHasNextPage((nextByFlags ?? hasNextByTotal) === true);
  };

  const changeStatus = (id, newLabel) => {
    if (!newLabel) return;
    setPendingChange({ id, newLabel });
    setConfirmOpen(true);
  };

 const getConfirmTitle = (label) => {
   if (!label) return "회원 상태를 변경하시겠습니까?";

   // '정지' 또는 '비활성'으로 변경 시
   if (label.includes("정지") || label.includes("비활성")) {
     return `${label} 상태로 변경하시겠습니까?`;
   }

   // '정상' 또는 '활성'으로 변경 시 (정지 상태에서 '복구'하는 의미)
   if (label.includes("정상") || label.includes("활성")) {
     return `${label} 상태로 복구하시겠습니까?`;
   }

   return `${label} 상태로 변경하시겠습니까?`;
 };

  const getConfirmDescription = (label) => {
    if (!label) return "선택하신 회원의 상태를 변경하시겠습니까?";

    // '정지' 관련 상태 (정지, 비활성)
    if (label.includes("정지") || label.includes("비활성")) {
        return (
                  <>
                    해당 회원의 서비스 이용이 정지/제한되며,
                    <br />
                    로그인할 수 없습니다.
                    <br />
                    계속 진행하시겠습니까?
                  </>
                );
    }

    // '정상' 관련 상태 (정상, 활성)
    if (label.includes("정상") || label.includes("활성")) {
      return (
              <>
                해당 회원의 서비스 이용이 정상적으로 복구되며,
                <br />
                즉시 로그인이 가능해집니다.
                <br />
                계속 진행하시겠습니까?
              </>
            );
    }

    return `선택한 회원의 상태를 [${label}]로 변경하시겠습니까?`;
  };

  useEffect(() => {
    fetchUsers(1);
  }, [sort, token]);

  const userManageOptions = manageOptions;

  // 페이지네이션 노출
  const showPagination =
    list.length > 0 && (totalPages > 1 || totalElements > PAGE_SIZE || hasNextPage);

  return (
    <div className="container adminUser-container">
      <div className="inner">
        <h2 className="adminUser__title">회원 관리</h2>

        <div className="table-controls">
          <Select value={sort} onChange={setSort} options={filterOptionsUser} />
          <SearchHeader
            searchValue={keyword}
            onSearchChange={setKeyword}
            onSearchClick={() => fetchUsers(1)}
            placeholder="이름/아이디/이메일"
            className=""
          />
        </div>

        <div className="table-keeper" style={{ "--rows": PAGE_SIZE }}>
          {totalElements === 0 ? (
            <div className="empty-state">
              <p className="no-posts">조회 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>번호</th>
                      <th style={{ width: "15%" }}>이름</th>
                      <th style={{ width: "15%" }}>아이디</th>
                      <th style={{ width: "20%" }}>이메일</th>
                      <th style={{ width: "20%" }}>전화번호</th>
                      <th style={{ width: "20%" }}>가입일</th>
                      <th style={{ width: "5%" }}>관리</th>
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
                            className="table-select"
                            value={statusLabelFromCode(u.status)}
                            onChange={(e) => changeStatus(u.user_id, e.target.value)}
                          >
                            {userManageOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="table-pagination">
          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => fetchUsers(p)}
            />
          )}
        </div>

       <ConfirmModal
         open={confirmOpen}
         title={getConfirmTitle(pendingChange?.newLabel)}
         description={getConfirmDescription(pendingChange?.newLabel)}
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
           fetchUsers(currentPage);
         }}
         onCancel={() => {
           setConfirmOpen(false);
           setPendingChange(null);
         }}
       />
      </div>
    </div>
  );
}
