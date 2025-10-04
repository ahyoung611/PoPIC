import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import apiRequest from "../../utils/apiRequest.js";
import PopupDetailModal from "./PopupDetailModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import SearchHeader from "../../components/commons/SearchHeader.jsx";
import ConfirmModal from "../../components/commons/ConfirmModal.jsx";

import "../../style/table.css";

const PAGE_SIZE = 10;

const toInt = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function AdminPopup() {
  const token = useAuth().getToken();

  const [popupList, setPopupList] = useState([]);
  const [sort, setSort] = useState("");
  const [keyword, setKeyword] = useState("");

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // 상태 변경 ConfirmModal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null); // { id, newLabel }

  // 목록 조회
  const fetchPopup = async (page = 1) => {
    const res = await apiRequest(
      `/admin/popup?sort=${encodeURIComponent(sort)}&keyword=${encodeURIComponent(
        keyword
      )}&page=${page - 1}&size=${PAGE_SIZE}`,
      { credentials: "include" },
      token
    );

    const isArray = Array.isArray(res);
    const fullList = isArray ? res : res?.content ?? [];

    const start = (page - 1) * PAGE_SIZE;
    const pageList = isArray ? fullList.slice(start, start + PAGE_SIZE) : fullList;
    setPopupList(pageList);

    // 전체 개수
    const total =
      toInt(res?.totalElements) ??
      toInt(res?.total) ??
      toInt(res?.totalCount) ??
      toInt(res?.count) ??
      fullList.length;
    setTotalElements(total);

    // 전체 페이지
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

  // 상태 변경 API
  const fetchPopupStatus = async (storeId, statusCode) => {
    await apiRequest(
      `/admin/popupConfirm?popupId=${storeId}&statusCode=${statusCode}`,
      { credentials: "include" },
      token
    );
  };

  // 셀렉트 변경 → 모달 오픈 (실제 변경은 모달 확인 시)
  const requestChangeStatus = (storeId, newLabel) => {
    if (!newLabel) return;
    setPendingChange({ id: storeId, newLabel });
    setConfirmOpen(true);
  };

  // 라벨 → 코드 매핑
  const statusCodeFromLabel = (label) => {
    if (label === "승인") return 1;
    if (label === "반려") return 3;
    // "선택"(=대기/보류) 포함 기타는 2
    return 2;
  };

  // 모달 타이틀
  const getConfirmTitle = (label) => {
    if (!label) return "상태를 변경하시겠습니까?";
    if (label === "승인") return "승인하시겠습니까?";
    if (label === "반려") return "반려하시겠습니까?";
    return "대기 상태로 변경하시겠습니까?";
  };

  // 모달 설명
  const getConfirmDescription = (label) => {
    if (!label) return "선택한 상태로 변경하시겠습니까?";

    if (label === "승인") {
      return (
        <>
          선택한 팝업을 승인합니다.
          <br />
          승인 시 사이트에 노출될 수 있습니다.
          <br />
          계속 진행하시겠습니까?
        </>
      );
    }

    if (label === "반려") {
      return (
        <>
          선택한 팝업을 반려합니다.
          <br />
          노출되지 않으며, <br />
          필요 시 사유 안내가 필요할 수 있습니다.
          <br />
          계속 진행하시겠습니까?
        </>
      );
    }

    return (
      <>
        팝업 상태를 대기로 변경합니다.
        <br />
        검토 중 상태이며 노출되지 않습니다.
        <br />
        계속 진행하시겠습니까?
      </>
    );
  };

  // 모달 확인
  const confirmChange = async () => {
    if (!pendingChange) return;
    const { id, newLabel } = pendingChange;
    const statusCode = statusCodeFromLabel(newLabel);

    await fetchPopupStatus(id, statusCode);
    setConfirmOpen(false);
    setPendingChange(null);
    fetchPopup(currentPage);
  };

  // 모달 취소
  const cancelChange = () => {
    setConfirmOpen(false);
    setPendingChange(null);
  };

  useEffect(() => {
    fetchPopup(1);
  }, [sort, token]);

  const adminPopupDetail = (popup) => {
    setSelected(popup);
    setModal(true);
  };

  // 페이지네이션 노출
  const showPagination =
    popupList.length > 0 &&
    (totalPages > 1 || totalElements > PAGE_SIZE || hasNextPage);

  return (
    <div className="container adminPopup-container">
      <div className="inner admin-popup">
        <h2 className="adminPopup__title">팝업스토어 관리</h2>

        {/* 검색/정렬 */}
        <div className="table-controls">
          <Select
            value={sort}
            onChange={setSort}
            options={[
              { label: "선택", value: "" },
              { label: "승인", value: "approved" },
              { label: "반려", value: "rejected" },
            ]}
          />
          <SearchHeader
            searchValue={keyword}
            onSearchChange={setKeyword}
            onSearchClick={() => fetchPopup(1)}
            placeholder="팝업명 검색"
            className=""
          />
        </div>

        {/* 리스트/빈상태 */}
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
                      <th style={{ width: "45%" }}>팝업명</th>
                      <th style={{ width: "10%" }}>담당자</th>
                      <th style={{ width: "15%" }}>전화번호</th>
                      <th style={{ width: "15%" }}>등록날짜</th>
                      <th style={{ width: "5%" }}>관리</th>
                      <th style={{ width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {popupList.map((item, index) => (
                      <tr key={index}>
                        <td>{item.store_id}</td>
                        <td>{item.store_name}</td>
                        <td>{item.vendor?.manager_name}</td>
                        <td>{item.vendor?.phone_number}</td>
                        <td>
                          {item.join_date &&
                            new Date(item.join_date).toLocaleDateString()}
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={
                              item.status === 2
                                ? "선택"
                                : item.status === 1
                                ? "승인"
                                : "반려"
                            }
                            onChange={(e) =>
                              requestChangeStatus(item.store_id, e.target.value)
                            }
                          >
                            <option value="선택">선택</option>
                            <option value="승인">승인</option>
                            <option value="반려">반려</option>
                          </select>
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            color="gray"
                            onClick={() => adminPopupDetail(item)}
                          >
                            상세
                          </Button>
                        </td>
                      </tr>
                    ))}
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
              onPageChange={(p) => fetchPopup(p)}
            />
          )}
        </div>

        <PopupDetailModal
          popup={selected}
          isOpen={modal}
          onClose={() => setModal(false)}
        />

        <ConfirmModal
          open={confirmOpen}
          title={getConfirmTitle(pendingChange?.newLabel)}
          description={getConfirmDescription(pendingChange?.newLabel)}
          okText="네"
          cancelText="아니오"
          danger={pendingChange?.newLabel === "반려"}
          onConfirm={confirmChange}
          onCancel={cancelChange}
        />
      </div>
    </div>
  );
}