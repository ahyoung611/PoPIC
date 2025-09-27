import {useAuth} from "../../context/AuthContext.jsx";
import {useEffect, useState} from "react";
import "../../style/myPage.css";
import {useNavigate} from "react-router-dom";
import Button from "../../components/commons/Button.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyPosts = () => {
    const {auth, getToken} = useAuth();
    const token = getToken();
    const [posts, setPosts] = useState([]);
    const nav = useNavigate();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("created_at");
    const [direction, setDirection] = useState("desc");
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const userId = auth?.user?.user_id;
        if (!userId) return;
        fetch(`${URL}/board/user/${userId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => res.json())
            .then(data => {
                setPosts(data.content);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("게시글 내역 조회 실패", err));
    }, [token, page, size, sortBy, direction]);

    return (
        <div className="myposts-container">
            <h3 className="myposts-title">나의 글</h3>

            <div className="myposts-list">
                {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map(p => (
                        <div key={p.boardId} className="myposts-item">
                            {/* 썸네일 */}
                            <div className="thumb">
                                {p.files && p.files.length > 0 ? (
                                    <img
                                        src={`${URL}${p.files[0].url}`}
                                        alt={p.files[0].originalName || "게시글 썸네일"}
                                    />
                                ) : (
                                    <div style={{background:"#f5f5f5", width:"100%", height:"100%"}} />
                                )}
                            </div>

                            {/* 글 정보 */}
                            <div className="info">
                                <div className="title">{p.title}</div>
                                <div className="meta">
                                    <span>{p.user?.name || "익명"}</span>
                                    <span>{new Date(p.createdAt).toLocaleDateString("ko-KR")}</span>
                                </div>
                                <div className="content">{p.content}</div>
                            </div>

                            {/* 오른쪽 버튼 */}
                            <div className="right">
                                <Button
                                    variant="label"
                                    onClick={() => nav(`/board/${p.boardId}`)}
                                >
                                    상세보기
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-posts">작성한 글이 없습니다.</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
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
    );
};

export default MyPosts;
