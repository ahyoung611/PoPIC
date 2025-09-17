import { useEffect, useRef, useState } from "react";
import "../../style/BoardEditor.css";

/**
 * 범용 파일 업로드 컴포넌트
 */
export default function FileUpload({
                                       value = [],
                                       onChange,
                                       accept = "image/*",
                                       multiple = true,
                                       endpoint = "/board/upload",
                                       deleteEndpoint = "/board/deleteFile",
                                       headers = undefined,
                                       maxSizeMB = 10,
                                       onUploadingChange,
                                       renderItem,
                                   }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        onUploadingChange?.(uploading);
    }, [uploading, onUploadingChange]);

    useEffect(() => {
        // 언마운트 시 업로드 중이면 취소
        return () => abortRef.current?.abort?.();
    }, []);

    const pickFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) { // ← 선택 안 했을 때 조용히 종료
            inputRef.current && (inputRef.current.value = "");
            return;
        }

        // 용량 검증
        const tooBig = files.find((f) => f.size > maxSizeMB * 1024 * 1024);
        if (tooBig) {
            alert(`'${tooBig.name}' 가 ${maxSizeMB}MB를 초과합니다.`);
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        setUploading(true);
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch(endpoint, { method: "POST", body: fd, signal: controller.signal, headers });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`업로드 실패 (${res.status}) ${txt}`);
            }
            const data = await res.json();
            onChange?.([...(value || []), ...data]);
            inputRef.current && (inputRef.current.value = "");
        } catch (err) {
            if (err.name !== "AbortError") alert(err.message || "업로드 오류");
        } finally {
            setUploading(false);
        }
    };

    const removeServerFile = async (fileName) => {
        try {
            const res = await fetch(deleteEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(headers || {}) },
                body: JSON.stringify({ fileName }),
            });
            if (!res.ok) throw new Error("삭제 실패");
            onChange?.((value || []).filter((f) => f !== fileName));
        } catch (e) {
            alert(e.message || "삭제 오류");
        }
    };

    return (
        <div className="be-upload">
            <div className="be-file-row">
                <input
                    ref={inputRef}
                    id="fileUploadInput"
                    className="be-file-input"
                    type="file"
                    name="files"
                    multiple={multiple}
                    accept={accept}
                    onChange={pickFiles}
                    disabled={uploading}
                />
                <label htmlFor="fileUploadInput" className="be-file-btn">
                    {uploading ? "업로드 중..." : "파일 ++"}
                </label>
            </div>

            {!!(value && value.length) && (
                <ul className="be-file-list">
                    {value.map((name) => (
                        <li key={name} className="be-file-item">
                            {renderItem ? (
                                renderItem(name, () => removeServerFile(name))
                            ) : (
                                <>
                                    <span className="be-file-name" title={name}>{name}</span>
                                    <button
                                        type="button"
                                        className="be-chip-remove"
                                        onClick={() => removeServerFile(name)}
                                    >
                                        삭제
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
