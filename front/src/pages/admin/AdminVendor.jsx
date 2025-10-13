import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import ConfirmModal from "../../components/commons/ConfirmModal.jsx";
import {
  filterOptionsVendor,
  manageOptionsVendor,
  vendorStatusLabelFromCode,
  vendorStatusCodeFromLabel,
} from "../../utils/statusUtil.js";
import SearchHeader from "../../components/commons/SearchHeader.jsx";
import "../../style/table.css";

const PAGE_SIZE = 10;

const toInt = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const mapFilterToServer = (v) => {
  const s = String(v ?? "");
  if (s === "") return { sort: "", status: null };

  if (/^\d+$/.test(s)) {
    const status = Number(s);
    const sort =
      status === 2 ? "pending" :
      status === 1 ? "normal"  :
      status === 0 ? "blocked" :
      status === 3 ? "rejected" : "";
    return { sort, status };
  }
  const toStatus = { pending: 2, normal: 1, blocked: 0, rejected: 3 };
  return { sort: s, status: toStatus[s] ?? null };
};

export default function AdminVendor() {
  const token = useAuth().getToken();

  const [sort, setSort] = useState("");
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState([]);

  // 페이징 메타
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // 상태 변경
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);

  const fetchVendors = async (page = 1) => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    params.set("page", String(page - 1));
    params.set("size", String(PAGE_SIZE));

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
    const fullList = isArray ? res : res?.content ?? [];

    const start = (page - 1) * PAGE_SIZE;
    const pageList = isArray ? fullList.slice(start, start + PAGE_SIZE) : fullList;
    setList(pageList);

    const total =
      toInt(res?.totalElements) ??
      toInt(res?.total) ??
      toInt(res?.totalCount) ??
      toInt(res?.count) ??
      fullList.length;
    setTotalElements(total);

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

  useEffect(() => {
    fetchVendors(1);
  }, [sort, token]);

  const changeStatus = (id, codeOrLabel) => {
    const code =
      typeof codeOrLabel === "number" ? codeOrLabel : vendorStatusCodeFromLabel(codeOrLabel);
    if (code === undefined || code === null) return;
    setPendingChange({ id, code });
    setConfirmOpen(true);
  };

  const getConfirmTitle = (code) => {
    switch (Number(code)) {
      case 0: return "정지하시겠습니까?"; // 정지
      case 1: return "정상으로 변경하시겠습니까?"; // 정상
      case 2: return "승인대기로 변경하시겠습니까?"; // 승인대기
      case 3: return "승인을 반려하시겠습니까?"; // 승인반려
      default: return "상태를 변경하시겠습니까?";
    }
  };

    const getConfirmDescription = (code) => {
      switch (Number(code)) {
        case 0: // 정지
          return (
            <>
              해당 운영자 계정이 정지되며,
              <br />
              로그인 및 팝업 등록/관리 기능이 제한됩니다.
              <br />
              계속 진행하시겠습니까?
            </>
          );
        case 1: // 정상
          return (
            <>
              운영자 계정을 정상 상태로 복구합니다.
              <br />
              즉시 로그인 및 관리 기능을 사용할 수 있습니다.
              <br />
              계속 진행하시겠습니까?
            </>
          );
        case 2: // 승인대기
          return (
            <>
              운영자 상태를 승인 대기로 변경합니다.
              <br />
              최종 승인까지 일부 기능이 제한될 수 있습니다.
              <br />
              계속 진행하시겠습니까?
            </>
          );
        case 3: // 승인반려
          return (
            <>
              해당 운영자의 승인 요청을 반려합니다.
              <br />
              사유를 안내 후 재신청을 유도해 주세요.
              <br />
              계속 진행하시겠습니까?
            </>
          );
        default:
          return "선택한 상태로 변경하시겠습니까?";
      }
    };

  const showPagination =
    list.length > 0 && (totalPages > 1 || totalElements > PAGE_SIZE || hasNextPage);

  return (
    <div className="container adminVendor-container">
      <div className="inner">
        <h2 className="adminVendor__title">팝업 운영자 관리</h2>

        {/* 검색/정렬 */}
        <div className="table-controls">
          <Select value={sort} onChange={setSort} options={filterOptionsVendor} />
          <SearchHeader
            searchValue={keyword}
            onSearchChange={setKeyword}
            onSearchClick={() => fetchVendors(1)}
            placeholder="업체명/담당자/아이디/사업자등록번호"
            className=""
          />
        </div>

        {/* 리스트/빈상태 고정 영역 */}
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
                      <th style={{ width: "6%" }}>번호</th>
                      <th style={{ width: "20%" }}>업체명</th>
                      <th style={{ width: "14%" }}>담당자</th>
                      <th style={{ width: "14%" }}>아이디</th>
                      <th style={{ width: "14%" }}>연락처</th>
                      <th style={{ width: "16%" }}>사업자등록번호</th>
                      <th style={{ width: "10%" }}>가입일</th>
                      <th style={{ width: "6%" }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((v) => {
                      const currentLabel = vendorStatusLabelFromCode(v.status);
                      const selectValue = manageOptionsVendor.some((o) => o.label === currentLabel)
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
                              className="table-select"
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
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="table-pagination">
          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => fetchVendors(p)}
            />
          )}
        </div>

        {/* 상태 변경 모달 */}
        <ConfirmModal
          open={confirmOpen}
          title={getConfirmTitle(pendingChange?.code)}
          description={getConfirmDescription(pendingChange?.code)}
          okText="네"
          cancelText="아니오"
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
            fetchVendors(currentPage);
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
