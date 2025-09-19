import React from 'react';
import Button from "../commons/Button.jsx";

export default function ProfileHeader({ name = '홍길동', avatarUrl, onEdit }) {
    return (
        <div className="profile">
            <div className="avatar">
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',borderRadius:'50%'}}/> : ''}
            </div>
            <div className={"userName"}>{name}</div>
            <Button className="userEdit" variant="outline" color="gray"
                    onClick={onEdit}>
                프로필 설정
            </Button>
        </div>
    );
}
