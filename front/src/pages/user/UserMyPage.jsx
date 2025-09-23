import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import "../../style/myPage.css";
import ProfileHeader from "../../components/mypage/ProfileHeader.jsx";
import QuickActions from "../../components/mypage/QuickActions.jsx";
import BookMarkList from "../../components/mypage/BookMarkList.jsx";
import apiRequest from "../../utils/apiRequest.js";

export default function UserMyPage() {
    const { auth } = useAuth();
    const token = auth.token;

    // 라우팅 & 네비게이션 훅
    const {userId} = useParams();
    const navigate = useNavigate();
    // 로컬 상태
    const [me, setMe] = useState(null);
    const [favs, setFavs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("latest");
    const [error, setError] = useState("");

    // 프로필 편집 화면으로 이동
    const goProfileEdit = () => navigate(`/userMyPage/profile/${userId}`);

    // 상세 페이지로 이동
    const handleOpenDetail = (id) => navigate(`/popupStore/detail/${id}`);

    useEffect(() => {
        if (!userId || !token) {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. 프로필 정보 조회
                const user = await apiRequest(`/api/users/${userId}`, {}, token);
                let avatarUrl = "";
                if (user.avatarExists) {
                    const photoResponse = await fetch(`/api/users/${userId}/photo`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (photoResponse.ok) {
                        const blob = await photoResponse.blob();
                        avatarUrl = URL.createObjectURL(blob);
                    }
                }
                setMe({
                    name: user.name,
                    avatarUrl: avatarUrl,
                    email: user.email ?? "",
                    phone_number: user.phone_number ?? "",
                    login_id: user.login_id ?? "",
                });

                // 2. 즐겨찾기 목록 조회
                const list = await apiRequest(`/api/users/${userId}/favorites?sort=${sort}`, {}, token);
                setFavs(Array.isArray(list) ? list : []);

                setError("");
            } catch (err) {
                console.error("데이터를 불러오지 못했습니다.:", err);
                setError("데이터를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    },  [userId, sort, token]);

    // 좋아요 토글
    const handleToggleLike = async (popupId) => {
        // UI를 즉시 업데이트
        setFavs((prev) => prev.map((it) => (it.id === popupId ? {...it, liked: !it.liked} : it)));
        try {
            await apiRequest(`/api/users/${userId}/favorites/${popupId}`, { method: "POST" }, token);
        } catch {
            // 요청 실패 시 UI 롤백
            setFavs((prev) => prev.map((it) => (it.id === popupId ? {...it, liked: !it.liked} : it)));
            console.error("좋아요 변경에 실패했습니다.");
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="container">
            <div className={"inner"}>
                <div className={"userMyPage"}>
                    <ProfileHeader
                        userId={userId}
                        name={me?.name ?? "사용자"}
                        avatarUrl={me?.avatarUrl}
                        onEdit={goProfileEdit}
                    />

                    <QuickActions
                        onClickMyPopic={() => navigate(`/userMyPage/${userId}`)}
                        onClickMyReview={() => console.log("나의 리뷰")}
                        onClickMyPosts={() => console.log("나의 글")}
                    />

                    <BookMarkList
                        items={favs}
                        loading={loading}
                        onSortChange={setSort}
                        onToggleLike={handleToggleLike}
                        onOpenDetail={handleOpenDetail}
                    />
                </div>
            </div>
        </div>
    );
}