import React from 'react';

export default function ProfileHeader({ name = '홍길동', avatarUrl, onEdit }) {
    return (
        <div className="profile">
            <div className="avatar">
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',borderRadius:'50%'}}/> : '👤'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{name}</div>
            <button className="card" style={{ display:'inline-block', marginTop:12, padding:'8px 16px', borderRadius:999 }}
                    onClick={onEdit}>
                프로필 설정
            </button>
        </div>
    );
}
