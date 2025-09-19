import React from 'react';

export default function QuickActions({ onClickMyPopic, onClickMyReview, onClickMyPosts }) {
    const Item = ({ label, onClick }) => (
        <div className="action" onClick={onClick} role="button" tabIndex={0}>
            <div>{label}</div>
        </div>
    );

    return (
        <div className="card actions">
            <Item label="나의 팝픽" onClick={onClickMyPopic}/>
            <Item label="나의 리뷰" onClick={onClickMyReview}/>
            <Item label="나의 글" onClick={onClickMyPosts}/>
        </div>
    );
}
