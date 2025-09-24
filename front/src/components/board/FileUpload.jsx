import {useEffect, useRef, useState} from "react";
import "../../style/board.css";
import {useAuth} from "../../context/AuthContext.jsx";

const API = "http://localhost:8080";

export default function FileUpload({
                                       value = [],
                                       onChange,
                                       accept = "image/*",
                                       multiple = true,
                                       endpoint = `${API}/board/upload`,
                                       deleteEndpoint = `${API}/board/deleteFile`,
                                       headers = undefined,
                                       maxSizeMB = 10,
                                       onUploadingChange,
                                       renderItem,
                                   }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const abortRef = useRef(null);
    const {auth} = useAuth();
    const token = auth?.token;

    useEffect(() => {
        onUploadingChange?.(uploading);
    }, [uploading, onUploadingChange]);
    useEffect(() => () => abortRef.current?.abort?.(), [token]);

    const normalizeItem = (item) =>
        typeof item === "string" ? {originalName: item, savedName: item} : item;

    const getKey = (item) => normalizeItem(item).savedName || String(item);
    const getLabel = (item) => normalizeItem(item).originalName || normalizeItem(item).savedName;

    const pickFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) {
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

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
            const res = await fetch(endpoint, {
                method: "POST", body: fd, signal: controller.signal, headers: {
                    ...(headers || {}),
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error("UPLOAD ERROR", res.status, txt);
                throw new Error(`업로드 실패 (${res.status})`);
            }
            const data = await res.json(); // [{originalName, savedName}] 예상
            // 중복 제거(저장명 기준)
            const existing = new Set((value || []).map((v) => getKey(v)));
            const merged = [...(value || [])];
            for (const it of data) {
                if (!existing.has(getKey(it))) merged.push(it);
            }
            onChange?.(merged);
            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            if (err.name !== "AbortError") alert(err.message || "업로드 오류");
        } finally {
            setUploading(false);
        }
    };

    const removeServerFile = async (item) => {
        const {savedName} = normalizeItem(item);
        try {
            const res = await fetch(deleteEndpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json", ...(headers || {}), "Authorization": `Bearer ${token}`,},
                credentials: "include",
                body: JSON.stringify({fileName: savedName}),
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error("DELETE ERROR", res.status, txt);
                throw new Error("삭제 실패");
            }
            onChange?.((value || []).filter((v) => getKey(v) !== savedName));
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
                    {value.map((item) => (
                        <li key={getKey(item)} className="be-file-item">
                            {renderItem ? (
                                renderItem(item, () => removeServerFile(item))
                            ) : (
                                <>
                  <span className="be-file-name" title={getLabel(item)}>
                    {getLabel(item)}
                  </span>
                                    <button
                                        type="button"
                                        className="be-chip-remove"
                                        onClick={() => removeServerFile(item)}
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
