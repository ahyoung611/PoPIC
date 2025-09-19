// src/components/mypage/FavoriteItem.jsx
import React from 'react';

export default function BookMarkItem({ item, onToggleLike, onOpenDetail }) {
    return (
        <div className="favorite-item">
            <img src={item.thumbnailUrl} alt={item.title}/>
            <div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{item.title}</div>
                <div style={{ color:'#777', fontSize:14 }}>{item.periodText}</div>
                <div className="favorite-meta">
                    {item.tag && <span className="badge">{item.tag}</span>}
                </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <button className="link" onClick={() => onOpenDetail?.(item.id)}>상세 보기 →</button>
                <button className="heart" aria-label="찜" onClick={() => onToggleLike?.(item.id)}>
                    {item.liked ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    );
}
