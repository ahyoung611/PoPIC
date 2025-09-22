import React, { useEffect, useRef, useState } from "react";
import "../../style/profilePhoto.css";

export default function ProfilePhoto({
                                         initialUrl = "",
                                         defaultUrl = "/default-profile.png",
                                         readOnly = true,          // 수정 모드 여부
                                         size = 160,
                                         maxBytes = 5 * 1024 * 1024,
                                         onChange,                 // { file, preview, removed }
                                     }) {
    // 상태 관리
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(initialUrl || defaultUrl);

    // 외부 initialUrl 동기화
    useEffect(() => setPreview(initialUrl || defaultUrl), [initialUrl, defaultUrl]);

    // 이미지 선택
    const handlePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (maxBytes && f.size > maxBytes) {
            alert(`이미지 용량은 ${(maxBytes / (1024 * 1024)).toFixed(1)}MB 이하여야 합니다.`);
            e.target.value = "";
            return;
        }
        if (!f.type.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            e.target.value = "";
            return;
        }

        const url = URL.createObjectURL(f);
        setPreview(url);

        console.log("선택된 파일", f); // 디버깅용
        onChange?.({ file: f, preview: url, removed: false });
    };

    // 이미지 삭제
    const handleRemove = () => {
        if (!confirm("프로필 이미지를 제거할까요?")) return;
        setPreview(defaultUrl);
        onChange?.({ file: null, preview: defaultUrl, removed: true });
    };

    const wrapStyle = { width: size, height: size };

    return (
        <div className={`profilePhoto-picker ${readOnly ? "is-readonly" : ""}`}>
            <div
                className="profilePhoto-wrap"
                style={wrapStyle}
                onClick={() => !readOnly && inputRef.current?.click()}
                role="button"
                aria-label="프로필 사진 변경"
            >
                <img
                    className="profilePhoto-img"
                    src={preview || defaultUrl}
                    alt="profile"
                    onError={(e) => { e.currentTarget.src = defaultUrl; }}
                />

                {/* 수정 모드에서만 카메라 버튼 */}
                {!readOnly && (
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
                )}

                {/* 수정 모드에서 삭제 버튼 */}
                {!readOnly && (
                    <button
                        type="button"
                        className="profilePhoto-remove"
                        onClick={handleRemove}
                        title="사진 삭제"
                    >
                        ✕
                    </button>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePick}
                    style={{ display: "none" }}
                />
            </div>
        </div>
    );
}
