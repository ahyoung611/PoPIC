import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";

import "../../style/myPage.css";
import ProfileHeader from "../../components/mypage/ProfileHeader.jsx";
import QuickActions from "../../components/mypage/QuickActions.jsx";
import BookMarkList from "../../components/mypage/BookMarkList.jsx";
import apiRequest from "../../utils/apiRequest.js";

export default function UserMyPage() {
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

    // 사용자(프로필) 정보 조회
    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const user = await apiRequest(`/api/users/${userId}`);

                let avatarUrl = "";
                if (user.avatarExists) {
                    try {
                        const photoResponse = await fetch(`/api/users/${userId}/photo`);
                        if (photoResponse.ok) {
                            const blob = await photoResponse.blob();
                            avatarUrl = URL.createObjectURL(blob);
                        }
                    } catch (error) {
                        console.error("Failed to fetch profile photo:", error);
                    }
                }

                setMe({
                    name: user.name,
                    avatarUrl: avatarUrl,
                    email: user.email ?? "",
                    phone_number: user.phone_number ?? "",
                    login_id: user.login_id ?? "",
                });
                setError("");
            } catch {
                setError("사용자 정보를 불러오지 못했습니다.");
            }
        })();
    }, [userId]);

    // 즐겨찾기 목록 조회
    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        (async () => {
            try {
                const list = await apiRequest(`/api/users/${userId}/favorites?sort=${sort}`);
                setFavs(Array.isArray(list) ? list : []);
                setError("");
            } catch {
                setError("목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [userId, sort]);

    // 좋아요 토글
    const handleToggleLike = async (popupId) => {
        setFavs((prev) => prev.map((it) => (it.id === popupId ? {...it, liked: !it.liked} : it)));
        try {
            await apiRequest(`/api/users/${userId}/favorites/${popupId}`, {method: "POST"});
        } catch {
            setFavs((prev) => prev.map((it) => (it.id === popupId ? {...it, liked: !it.liked} : it)));
            console.error("좋아요 변경에 실패했습니다.");
        }
    };

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
                        // alert()는 캔버스에서 작동하지 않으므로 대신 로그를 출력합니다.
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
