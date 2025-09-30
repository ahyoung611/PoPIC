import {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import "../../style/myPosts.css";
import {useNavigate} from "react-router-dom";
import Pagination from "../../components/commons/Pagination.jsx";
import Select from "../../components/commons/Select.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReviews = () => {
    const {auth, getToken} = useAuth();
    const token = getToken();
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("createdAt"); // Review 엔티티 필드명
    const [direction, setDirection] = useState("desc");
    const [totalPages, setTotalPages] = useState(0);
    const nav = useNavigate();

    useEffect(() => {
        const userId = auth?.user?.user_id;
        if (!userId) return;

        fetch(`${URL}/popupStore/user/${userId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setReviews(data.content || []);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("내 리뷰 조회 실패", err));
    }, [token, page, size, sortBy, direction, auth]);

    return (
        <div className="container">
            <div className="myposts-container">
                <div className="myposts-header">
                    <h3 className="myposts-title">나의 리뷰</h3>

                    <Select
                        options={[
                            { label: "최신순", value: "createdAt_desc" },
                            { label: "오래된순", value: "createdAt_asc" },
                        ]}
                        value={`${sortBy}_${direction}`}
                        onChange={(val) => {
                            const lastUnderscore = val.lastIndexOf("_");
                            const field = val.substring(0, lastUnderscore);
                            const dir = val.substring(lastUnderscore + 1);
                            setSortBy(field);
                            setDirection(dir);
                            setPage(0);
                        }}
                        className="myposts-sort"
                    />
                </div>

                <div className="myposts-list">
                    {Array.isArray(reviews) && reviews.length > 0 ? (
                        reviews.map(r => (
                            <div
                                key={r.review_id}
                                className="myposts-item"
                                style={{cursor: "pointer"}}
                                onClick={() => {
                                    nav(`/popupStore/detail/${r.store?.store_id}`, {state: {tab: "리뷰"}});
                                }}
                            >
                                {/* 썸네일 */}
                                <div className="thumb">
                                    {r.images && r.images.length > 0 ? (
                                        <img
                                            src={`${URL}/images?type=review&id=${r.images[0]}`}
                                            alt="리뷰 썸네일"
                                        />
                                    ) : (
                                        <div style={{background: "#f5f5f5", width: "100%", height: "100%"}}/>
                                    )}
                                </div>

                                {/* 정보 */}
                                <div className="info">
                                    <div className="title">
                                        {r.store?.store_name && (
                                            <span style={{color: "#FF5148", marginRight: "6px"}}>
                                                [{r.store.store_name}]
                                            </span>
                                        )}
                                        {r.title || "제목 없음"}
                                    </div>
                                    <div className="meta">
                                        <span>{r.user?.name || "익명"}</span>
                                        <span>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                                    </div>
                                    <div className="content">{r.content}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-posts">작성한 리뷰가 없습니다.</p>
                    )}
                </div>

                <Pagination
                    currentPage={page + 1}
                    totalPages={Math.max(totalPages, 1)}
                    onPageChange={(p) => setPage(p - 1)}
                />
            </div>
        </div>
    )
}

export default MyReviews;
