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

    const [popups, setPopups] = useState([]);

   useEffect(() => {
       if (!userId || !token) return;

       const fetchAllData = async () => {
           setLoading(true);
           try {
               // 유저 프로필
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
               setMe({ name: user.name, avatarUrl, email: user.email ?? "", phone_number: user.phone_number ?? "", login_id: user.login_id ?? "" });

               // 북마크
               const favList = await apiRequest(`/api/users/${userId}/favorites?sort=${sort}`, {}, token);
               const favsArray = Array.isArray(favList) ? favList : [];
               setFavs(favsArray);

               // 전체 팝업 리스트
               const popupList = await apiRequest("/popupStore/list", {}, token);
               const popupArray = Array.isArray(popupList) ? popupList : [];

               // 북마크 상태 합치기
               const merged = popupArray.map(p => ({
                   ...p,
                   liked: favsArray.some(f => f.id === p.id)
               }));

               setPopups(merged);

           } catch (err) {
               console.error("데이터를 불러오지 못했습니다.:", err);
               setError("데이터를 불러오지 못했습니다.");
           } finally {
               setLoading(false);
           }
       };

       fetchAllData();
   }, [userId, sort, token]);

    // 북마크 토글
    const handleToggleLike = async (popupId) => {
        try {
            const result = await apiRequest(
                `/userBookmark/toggle?userId=${userId}&storeId=${popupId}`,
                { method: "POST" },
                token
            );
            setPopups(prev => prev.map(p => p.id === popupId ? { ...p, liked: result } : p));
        } catch (err) {
            console.error("북마크 변경 실패:", err);
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