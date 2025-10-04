import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Select from "../../components/commons/Select.jsx";
import Button from "../../components/commons/Button.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import SearchHeader from "../../components/commons/SearchHeader.jsx";

import "../../style/table.css";
import "../../style/reservationManage.css";

const PAGE_SIZE = 10;

export default function ReservationManage() {
  const { vendorId } = useParams();
  const token = useAuth().getToken();

  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("");
  const [reservationList, setReservationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReservation = async (page = 1) => {
    try {
      const res = await apiRequest(
        `/vendor/reservationList?vendorId=${vendorId}` +
          `&sort=${encodeURIComponent(sort)}` +
          `&keyword=${encodeURIComponent(keyword)}` +
          `&page=${page}&size=${PAGE_SIZE}`,
        { credentials: "include" },
        token
      );
      setReservationList(res?.content ?? []);
      setTotalPages(res?.totalPages ?? 1);
      setTotalElements(res?.totalElements ?? 0);
      setCurrentPage(page);
    } catch (e) {
      console.error("예약 리스트 가져오기 실패", e);
      setReservationList([]);
      setTotalPages(1);
      setTotalElements(0);
    }
  };

  useEffect(() => {
    fetchReservation(1);
  }, [sort, token]);

  const statusMeta = (s) => {
      if (s === 0) return { text: "입장 완료", color: "red" };
      if (s === 1) return { text: "예약 완료", color: "red" };
      return { text: "예약 취소", color: "gray" };
    };

  const showPagination = totalElements >= PAGE_SIZE && totalPages > 1;

   return (
      <div className="container reservation-container">
        <div className="inner rm-page">
          <h1 className="rm-title">예약 관리</h1>

          <div className="table-controls">
            <Select
              value={sort}
              onChange={setSort}
              options={[
                { label: "전체", value: "" },
                { label: "예약", value: "reservation" },
                { label: "입장 완료", value: "complete" },
                { label: "예약 취소", value: "cancel" },
              ]}
            />

            <SearchHeader
              className="rm-search"
              searchValue={keyword}
              onSearchChange={setKeyword}
              onSearchClick={() => fetchReservation(1)}
              placeholder="예약자 이름 검색"
              showRegister={false}
            />
          </div>

          <div className="table-keeper" style={{ "--rows": PAGE_SIZE }}>
            {totalElements === 0 ? (
              <div className="empty-state">
                <p className="no-posts">예약내역이 없습니다.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table table--hover table--striped">
                  <thead>
                    <tr>
                      <th style={{ width: "10%" }}>예약 번호</th>
                      <th style={{ width: "20%" }}>예약자 명</th>
                      <th style={{ width: "10%" }}>인원</th>
                      <th style={{ width: "40%" }}>예약 시간</th>
                      <th style={{ width: "20%" }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservationList.map((item, idx) => {
                      const meta = statusMeta(item.status);
                      return (
                        <tr key={`${item.reservationId}-${idx}`}>
                          <td>{item.reservationId}</td>
                          <td>{item.user?.name ?? "-"}</td>
                          <td>{item.reservationCount}</td>
                          <td>{item.slot?.schedule?.date} {item.slot?.start_time}</td>
                          <td className="ta-center">
                            <Button variant="table" color={meta.color} disabled>
                              {meta.text}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="table-pagination">
            {showPagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => fetchReservation(p)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }