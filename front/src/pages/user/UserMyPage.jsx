import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import "../../style/myPage.css";
import ProfileHeader from "../../components/mypage/ProfileHeader.jsx";
import QuickActions from "../../components/mypage/QuickActions.jsx";
import BookMarkList from "../../components/mypage/BookMarkList.jsx";
import apiRequest from "../../utils/apiRequest.js";

export default function UserMyPage() {
    const { auth } = useAuth();
    const token = auth.token;

    const { userId } = useParams();
    const navigate = useNavigate();

    const [me, setMe] = useState(null);
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("latest");
    const [error, setError] = useState("");

    const goProfileEdit = () => navigate(`/userMyPage/profile/${userId}`);
    const handleOpenDetail = (id) => navigate(`/popupStore/detail/${id}`);

    useEffect(() => {
        if (!userId || !token) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. 유저 프로필
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
                    avatarUrl,
                    email: user.email ?? "",
                    phone_number: user.phone_number ?? "",
                    login_id: user.login_id ?? ""
                });

                // 북마크된 팝업 목록만 가져오기
                const bookmarkedPopupList = await apiRequest("/userBookmark/popupList", {}, token);
                const bookmarkedPopupArray = Array.isArray(bookmarkedPopupList) ? bookmarkedPopupList : [];

                const processedPopups = bookmarkedPopupArray.map(p => ({
                    id: Number(p.store_id),
                    liked: true, // 북마크 목록이므로 항상 true
                    title: p.store_name,
                    thumbnailUrl: p.thumb,
                    periodText: p.start_date && p.end_date ? `${p.start_date} ~ ${p.end_date}` : null,
                    tag: p.category_names?.[0] || null
                }));

                setPopups(processedPopups);

            } catch (err) {
                console.error("데이터를 불러오지 못했습니다.:", err);
                setError("데이터를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [userId, sort, token]);

    const handleToggleLike = async (popupId) => {
        try {
            const result = await apiRequest(`/userBookmark/toggle?userId=${userId}&storeId=${popupId}`, { method: "POST" }, token);
            // 북마크 해제 시 목록에서 제거
            setPopups(prev => prev.filter(p => p.id !== popupId));
        } catch {
            console.error("북마크 변경 실패");
        }
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="container">
            <div className="inner">
                <div className="userMyPage">
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
                        items={popups}
                        loading={loading}
                        sort={sort}
                        onSortChange={setSort}
                        onToggleLike={handleToggleLike}
                        onOpenDetail={handleOpenDetail}
                    />
                </div>
            </div>
        </div>
    );
}