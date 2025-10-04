import { useEffect, useState } from "react";
import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import SearchHeader from "../../components/commons/SearchHeader.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";

import "../../style/table.css";
import "../../style/fieldWaiting.css";

const PAGE_SIZE = 6;

export default function FieldWaiting() {
  const { getUser, getToken } = useAuth();
  const user = getUser();
  const token = getToken();

  const [sort, setSort] = useState("");
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [stats, setStats] = useState({ waitingNum: 0, entryNum: 0 });

  const statusMeta = (s) => {
    if (s === 1) return { text: "대기중", color: "gray" };
    if (s === 0) return { text: "입장 완료", color: "red" };
    return { text: "대기 취소", color: "gray" };
  };

  const fmtTime = (isoOrTime) => {
    if (!isoOrTime) return "-";
    try {
      const d = new Date(isoOrTime);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return String(isoOrTime).slice(0, 5);
    }
  };

  const fetchList = async (page = 1) => {
    const res = await apiRequest(
      `/vendor/fieldWaitingList?vendorId=${user.vendor_id}` +
        `&sort=${encodeURIComponent(sort)}` +
        `&keyword=${encodeURIComponent(keyword)}` +
        `&page=${page}&size=${PAGE_SIZE}`,
      {},
      token
    );
    const content = res?.content ?? [];
    setList(content);
    setTotalPages(res?.totalPages ?? 1);
    setTotalElements(res?.totalElements ?? content.length ?? 0);
    setCurrentPage(page);
  };

  const fetchStats = async () => {
    try {
      const [waitingRes, entryRes] = await Promise.all([
        apiRequest(
          `/vendor/fieldWaitingList?vendorId=${user.vendor_id}` +
            `&sort=waiting&keyword=${encodeURIComponent(keyword)}` +
            `&page=1&size=1`,
          {},
          token
        ),
        apiRequest(
          `/vendor/fieldWaitingList?vendorId=${user.vendor_id}` +
            `&sort=entry&keyword=${encodeURIComponent(keyword)}` +
            `&page=1&size=1`,
          {},
          token
        ),
      ]);
      setStats({
        waitingNum: waitingRes?.totalElements ?? 0,
        entryNum: entryRes?.totalElements ?? 0,
      });
    } catch (e) {
      console.error("집계 로드 실패", e);
      setStats({ waitingNum: 0, entryNum: 0 });
    }
  };

  useEffect(() => {
    fetchList(1);
  }, [sort, token]);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const runSearch = () => {
    fetchList(1);
    fetchStats();
  };

  const waitingCall = async (item) => {
    if (!window.confirm("호출 하시겠습니까?")) return;
    await apiRequest(`/vendor/waitingCall?id=${item.id}`, { method: "PUT" }, token);
    await Promise.all([fetchList(currentPage), fetchStats()]);
    alert("호출을 완료했습니다.");
  };

  const waitingEntry = async (item) => {
    if (!window.confirm("입장 처리 하시겠습니까?")) return;
    await apiRequest(`/vendor/waitingEntry?id=${item.id}`, { method: "PUT" }, token);
    await Promise.all([fetchList(currentPage), fetchStats()]);
    alert("입장 처리를 완료했습니다.");
  };

  const waitingCancel = async (item) => {
    if (!window.confirm("취소 처리 하시겠습니까?")) return;
    await apiRequest(`/vendor/waitingCancel?id=${item.id}`, { method: "PUT" }, token);
    await Promise.all([fetchList(currentPage), fetchStats()]);
    alert("취소 처리를 완료했습니다.");
  };

  const showPagination = totalElements >= PAGE_SIZE && totalPages > 1;

  const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.75a10.25 10.25 0 1 0 0 20.5 10.25 10.25 0 0 0 0-20.5Zm.75 5.5a.75.75 0 0 0-1.5 0v5l-.22.22-2 2a.75.75 0 0 0 1.06 1.06l2.16-2.16c.3-.3.45-.7.45-1.12V7.25Z"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.55 16.45 5.8 12.7a1 1 0 1 1 1.4-1.4l2.35 2.34 6.25-6.25a1 1 0 1 1 1.4 1.42l-6.95 6.94a1 1 0 0 1-1.4 0Z"/>
    </svg>
  );

  const totalForRing = Math.max(1, stats.waitingNum + stats.entryNum);

  return (
    <div className="container filedWaiting-container">
      <div className="inner field-waiting">
        <h1 className="fw-title">현장 관리</h1>

        <div className="fw-stats">
          <div
            className="stat-card is-waiting"
            style={{ "--value": stats.waitingNum, "--max": totalForRing }}
          >
            <div className="stat-icon"><ClockIcon /></div>
            <div className="stat-content">
              <div className="stat-title">대기중</div>
              <div className="stat-value">
                <span className="num">{stats.waitingNum}</span>
                <span className="unit">팀</span>
              </div>
            </div>
            <div className="stat-ring" aria-hidden="true" />
          </div>

          <div
            className="stat-card is-entry"
            style={{ "--value": stats.entryNum, "--max": totalForRing }}
          >
            <div className="stat-icon"><CheckIcon /></div>
            <div className="stat-content">
              <div className="stat-title">금일 입장</div>
              <div className="stat-value">
                <span className="num">{stats.entryNum}</span>
                <span className="unit">명</span>
              </div>
            </div>
            <div className="stat-ring" aria-hidden="true" />
          </div>
        </div>

        {/* 툴바 */}
        <div className="table-controls">
          <Select
            value={sort}
            onChange={setSort}
            options={[
              { label: "전체", value: "" },
              { label: "대기중", value: "waiting" },
              { label: "입장 완료", value: "entry" },
              { label: "대기 취소", value: "cancel" },
            ]}
          />
          <SearchHeader
            className="fw-search"
            searchValue={keyword}
            onSearchChange={setKeyword}
            onSearchClick={runSearch}
            placeholder="예약자 이름 검색"
            showRegister={false}
          />
        </div>

        {/* 리스트 영역 */}
        <div className="table-keeper" style={{ "--rows": PAGE_SIZE }}>
          {totalElements === 0 ? (
            <div className="empty-state">
              <p className="no-posts">대기 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table table--hover table--striped">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>대기 번호</th>
                    <th style={{ width: "20%" }}>예약자 명</th>
                    <th style={{ width: "30%" }}>호출 시간</th>
                    <th style={{ width: "15%" }}>상태</th>
                    <th style={{ width: "25%" }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, idx) => {
                    const meta = statusMeta(item.status);
                    const called = !!item.callTime;
                    return (
                      <tr key={`${item.id}-${idx}`}>
                        <td>{item.queueNumber}</td>
                        <td>{item.user?.name ?? "-"}</td>
                        <td>{called ? fmtTime(item.callTime) : "-"}</td>
                        <td>
                          <Button variant="table" color={meta.color} disabled>
                            {meta.text}
                          </Button>
                        </td>
                        <td>
                          {!called ? item.status !== -1 && (
                            <div className="btn-group">
                              <Button variant="ghost" color="gray" onClick={() => waitingCall(item)}>
                                호출
                              </Button>
                            </div>
                          ) : item.status === 1 ? (
                            <div className="btn-group">
                              <Button variant="ghost" color="gray" onClick={() => waitingEntry(item)}>
                                입장 완료
                              </Button>
                              <p>|</p>
                              <Button variant="ghost" color="gray" onClick={() => waitingCancel(item)}>
                                취소
                              </Button>
                            </div>
                          ) : (
                            <span className="muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="table-pagination">
          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                fetchList(p);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
