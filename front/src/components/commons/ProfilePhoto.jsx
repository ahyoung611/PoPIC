// ProfilePhoto.js
import React, { useEffect, useRef, useState } from "react";
import "../../style/profilePhoto.css";

export default function ProfilePhoto({
                                         initialUrl = "",
                                         defaultUrl = "/default-profile.png",
                                         readOnly = true,
                                         size = 160,
                                         maxBytes = 5 * 1024 * 1024,
                                         onChange,
                                     }) {
    // 파일 입력 요소를 참조
    const inputRef = useRef(null);
    // 미리보기 이미지 URL 상태
    const [preview, setPreview] = useState(initialUrl || defaultUrl);

    useEffect(() => {
        setPreview(initialUrl || defaultUrl);
    }, [initialUrl, defaultUrl]);

    const handlePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        // 파일 용량 검증
        if (maxBytes && f.size > maxBytes) {
            alert(`이미지 용량은 ${(maxBytes / (1024 * 1024)).toFixed(1)}MB 이하여야 합니다.`);
            e.target.value = "";
            return;
        }
        // 파일 타입 검증
        if (!f.type.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            e.target.value = "";
            return;
        }

        // 선택된 파일의 URL을 생성 - 미리보기 상태로 설정
        const url = URL.createObjectURL(f);
        setPreview(url);
        onChange?.({ file: f, preview: url, removed: false });
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (!confirm("프로필 이미지를 제거할까요?")) return;
        setPreview(defaultUrl);
        onChange?.({ file: null, preview: defaultUrl, removed: true });
    };

    const wrapStyle = { width: size, height: size };

    const isDefaultPhoto = preview === defaultUrl;

    return (
        <div className={`profilePhoto-picker ${readOnly ? "is-readonly" : ""}`}>
            <div className="profilePhoto-wrap" style={wrapStyle}>
                <img
                    className="profilePhoto-img"
                    src={preview}
                    alt="profile"
                    onError={(e) => { e.currentTarget.src = defaultUrl; }}
                />
            </div>

            {!readOnly && (
                <>
                    <button
                        type="button"
                        className="profilePhoto-fab"
                        aria-label="사진 변경"
                        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                        title="사진 변경"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M9 3l-1.8 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.2L15 3H9zM12 18a5 5 0 1 1 .001-10.001A5 5 0 0 1 12 18zm0-2.5a2.5 2.5 0 1 0 0-5.001 2.5 2.5 0 0 0 0 5.001z" />
                        </svg>
                    </button>

                    {!isDefaultPhoto && (
                        <button
                            type="button"
                            className="profilePhoto-remove"
                            onClick={handleRemove}
                            title="사진 삭제"
                        >
                            ✕
                        </button>
                    )}
                </>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handlePick}
                style={{ display: "none" }}
            />
        </div>
    );
}