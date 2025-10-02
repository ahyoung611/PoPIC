import {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import "../../style/myPosts.css";
import {useNavigate} from "react-router-dom"; // 동일 스타일 활용

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyReviews = () => {
    const {auth, getToken} = useAuth();
    const token = getToken();
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("createdAt");
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
            .then(res => res.json())
            .then(data => {
                setReviews(data.content);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("내 리뷰 조회 실패", err));
    }, [token, page, size, sortBy, direction]);

    return (
         <div className="container">
             <div className="inner">
                  <div className="myPosts">
                         <h1 className="page-title">나의 리뷰</h1>

            <div className="myPosts-list">
                {Array.isArray(reviews) && reviews.length > 0 ? (
                    reviews.map(r => (
                        <div
                            key={r.review_id}
                            className="myPosts-item"
                            style={{cursor: "pointer"}}
                            onClick={() => {
                                nav(`/popupStore/detail/${r.store?.store_id}`, { state: { tab: "리뷰" } });
                            }}
                        >
                            {/* 썸네일 */}
                            <div className="thumb">
                                    <img
                                        src={`http://localhost:8080/images?type=review&id=${r.images[0]}`}
                                        alt="리뷰 썸네일"
                                    />
                            </div>

                            {/* 정보 */}
                            <div className="info">
                                <div className="title">
                                    <p>[{r.store.store_name}]</p>

                                </div>
                                <div className="content">
                                     <p>{r.title }</p>
                                     <p >{r.content}</p>
                                    </div>
                                <div className="meta">
                                    <span>{r.user?.name || "익명"}</span>
                                    <p>작성날짜 : <span>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span></p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-posts">작성한 리뷰가 없습니다.</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({length: totalPages}, (_, i) => (
                        <button
                            key={i}
                            className={`page-btn ${i === page ? "active" : ""}`}
                            onClick={() => setPage(i)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
           </div>
        </div>
      </div>
    )
}

export default MyReviews;
