import { useParams } from "react-router-dom";
import Select from "../../components/commons/Select.jsx";
import { useEffect, useState } from "react";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import '../../style/reservationManage.css';

const ReservationManage = () => {
    const params = useParams();
    const vendorId = params.vendorId;
    const token = useAuth().getToken();

    const [keyword, setKeyword] = useState("");
    const [sort, setSort] = useState("");
    const [reservationList, setReservationList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // 한 페이지에 보여줄 데이터 수

    // 서버에서 예약 리스트 가져오기
    const fetchReservation = async (page = 1) => {
        try {
            const response = await apiRequest(
                `/vendor/reservationList?vendorId=${vendorId}&sort=${sort}&keyword=${keyword}&page=${page}&size=${pageSize}`,
                { credentials: "include" },
                token
            );

            // 서버가 { content: [], totalPages: n, totalElements: n } 형식으로 반환한다고 가정
            setReservationList(response.content);
            setTotalPages(response.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error("예약 리스트 가져오기 실패", error);
        }
    };

    // 정렬이나 토큰이 바뀌면 첫 페이지부터 가져오기
    useEffect(() => {
        fetchReservation(1);
    }, [sort, token]);

    return (
        <div className="container">
            <div className="inner reservationManage">
                <p className="title">예약 관리</p>

                {/* 검색 바 */}
                <div className="search-bar">
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
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="예약자 이름 검색"
                    />
                    <Button onClick={() => fetchReservation(1)}>검색</Button>
                </div>

                {/* 예약 리스트 테이블 */}
                <div className="list-table">
                    <table>
                        <thead>
                        <tr>
                            <th>예약 번호</th>
                            <th>예약자 명</th>
                            <th>인원</th>
                            <th>예약 시간</th>
                            <th>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservationList.map((item, index) => (
                            <tr key={index}>
                                <td>{item.reservationId}</td>
                                <td>{item.user.name}</td>
                                <td>{item.reservationCount}</td>
                                <td>{item.slot.schedule.date} {item.slot.start_time}</td>
                                <td>
                                    <p>
                                        {item.status === 0
                                            ? "입장 완료"
                                            : item.status === 1
                                                ? "예약 완료"
                                                : "예약 취소"}
                                    </p>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchReservation(page)}
                />
            </div>
        </div>
    );
};

export default ReservationManage;
