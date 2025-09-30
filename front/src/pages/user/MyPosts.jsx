import {useAuth} from "../../context/AuthContext.jsx";
import {useEffect, useState} from "react";
import "../../style/myPage.css";
import {useNavigate} from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import Pagination from "../../components/commons/Pagination.jsx";
import Select from "../../components/commons/Select.jsx";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const MyPosts = () => {
    const {auth, getToken} = useAuth();
    const token = getToken();
    const [posts, setPosts] = useState([]);
    const nav = useNavigate();

    const [page, setPage] = useState(0); // 서버 요청은 0-based
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("created_at");
    const [direction, setDirection] = useState("desc");
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const userId = auth?.user?.user_id;
        if (!userId) return;

        console.log("요청 params:", { page, size, sortBy, direction, token, userId });

        fetch(`${URL}/board/user/${userId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setPosts(data.content || []);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("게시글 내역 조회 실패", err));
    }, [token, page, size, sortBy, direction, auth]);

    return (
        <div className="container">
            <div className="myposts-container">
                <div className="myposts-header">
                    <h3 className="myposts-title">나의 글</h3>
                    <Select
                        options={[
                            { label: "최신순", value: "created_at_desc" },
                            { label: "오래된순", value: "created_at_asc" },
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
                                        <div style={{background: "#f5f5f5", width: "100%", height: "100%"}}/>
                                    )}
                                </div>

                                {/* 글 정보 */}
                                <div className="info">
                                    <div className="title">{p.title}</div>
                                    <div className="meta">
                                        <span>{p.writerName || "익명"}</span>
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
            </div>

            <Pagination
                currentPage={page + 1}
                totalPages={Math.max(totalPages, 1)}
                onPageChange={(p) => setPage(p - 1)}
            />
        </div>
    );
};

export default MyPosts;
