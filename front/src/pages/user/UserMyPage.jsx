// src/pages/MyPage.jsx
import React, { useEffect, useState } from 'react';
import '../../style/myPage.css';
import ProfileHeader from "../../components/mypage/ProfileHeader.jsx";
import QuickActions from "../../components/mypage/QuickActions.jsx";
import BookMarkList from "../../components/mypage/BookMarkList.jsx";

export default function MyPage() {
    const [me, setMe] = useState({ name: '김지영', avatarUrl: '' });
    const [favs, setFavs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('latest');
    const [error, setError] = useState('');

    // 사용자 정보
    useEffect(() => {
        (async () => {
            try {
                const data = await fetchMe(); // 실제 API 붙이면 교체
                setMe(data);
            } catch (e) {
                // 확실하지 않음: 서버/토큰 이슈일 수 있음
            }
        })();
    }, []);

    // 찜 목록
    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                const list = await fetchFavorites({ sort });
                setFavs(list);
                setError('');
            } catch (e) {
                setError('목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        })();
    }, [sort]);

    const handleToggleLike = (id) => {
        // 추측입니다: 서버 API가 있다면 호출 후 상태 갱신
        setFavs((prev) => prev.map(it => it.id === id ? { ...it, liked: !it.liked } : it));
    };

    const handleOpenDetail = (id) => {
        // 라우터 연결 시: navigate(`/popups/${id}`)
        alert(`상세로 이동: ${id}`); // 임시
    };

    return (
        <div className={"container userMyPage"}>
            <ProfileHeader
                name={me?.name ?? '사용자'}
                avatarUrl={me?.avatarUrl}
                onEdit={() => alert('프로필 설정으로 이동')}
            />

            <QuickActions
                onClickMyPopic={() => alert('나의 팝픽')}
                onClickMyReview={() => alert('나의 리뷰')}
                onClickMyPosts={() => alert('나의 글')}
            />

            {error && <div style={{ color:'#c00', marginTop:12 }}>{error}</div>}

            <BookMarkList
                items={favs}
                loading={loading}
                onSortChange={setSort}
                onToggleLike={handleToggleLike}
                onOpenDetail={handleOpenDetail}
            />
        </div>
    );
}
