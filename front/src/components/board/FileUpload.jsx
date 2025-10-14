import {useEffect, useRef, useState, useCallback} from "react";
import "../../style/board.css";
import {useAuth} from "../../context/AuthContext.jsx";

const API = "http://3.36.103.80:8080";

export default function FileUpload({
  required = true,
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
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef(null);
  const {auth} = useAuth();
  const token = auth?.token;

  useEffect(() => onUploadingChange?.(uploading), [uploading, onUploadingChange]);
  useEffect(() => () => abortRef.current?.abort?.(), [token]);

  const normalizeItem = (item) =>
    typeof item === "string" ? { originalName: item, savedName: item } : item;
  const getKey = (item) => normalizeItem(item).savedName || String(item);
  const getLabel = (item) => normalizeItem(item).originalName || normalizeItem(item).savedName;

  const validateSize = (files) => {
    const tooBig = files.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      alert(`'${tooBig.name}' 가 ${maxSizeMB}MB를 초과합니다.`);
      return false;
    }
    return true;
  };

  const doUpload = useCallback(async (files) => {
    if (!files.length) return;
    if (!validateSize(files)) return;

    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        signal: controller.signal,
        headers: { ...(headers || {}), Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("UPLOAD ERROR", res.status, txt);
        throw new Error(`업로드 실패 (${res.status})`);
      }
      const data = await res.json();
      const existing = new Set((value || []).map((v) => getKey(v)));
      const merged = [...(value || [])];
      for (const it of data) {
        if (!existing.has(getKey(it))) merged.push(it);
      }
      onChange?.(merged);
    } catch (err) {
      if (err.name !== "AbortError") alert(err.message || "업로드 오류");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      setDragOver(false);
    }
  }, [endpoint, headers, onChange, token, value]);

  const onPick = (e) => {
    const files = Array.from(e.target.files || []);
    doUpload(files);
  };

  const onDragOver = (e) => { e.preventDefault(); if (!uploading) setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files || []);
    doUpload(multiple ? files : files.slice(0,1));
  };

  const removeServerFile = async (item) => {
    const {savedName} = normalizeItem(item);
    try {
      const res = await fetch(deleteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ fileName: savedName }),
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
      <div
        className={`be-drop ${dragOver ? "is-over" : ""} ${uploading ? "is-disabled" : ""}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        aria-label="파일 선택"
        tabIndex={0}
        onKeyDown={(e)=> (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          className="be-drop__input"
          type="file"
          name="files"
          multiple={multiple}
          accept={accept}
          onChange={onPick}
          disabled={uploading}
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="be-drop__placeholder">
          {uploading ? "업로드 중..." : "파일을 선택하세요"}
        </div>
      </div>

      {!!(value && value.length) && (
        <ul className="be-filelist" aria-live="polite">
          {value.map((item) => (
            <li key={getKey(item)} className="be-filelist__item">
              {renderItem ? (
                renderItem(item, () => removeServerFile(item))
              ) : (
                <>
                  <span className="be-filelist__name" title={getLabel(item)}>
                    {getLabel(item)}
                  </span>
                  <button type="button" className="file-delete"  onClick={() => removeServerFile(item)} aria-label={`${getLabel(item)} 삭제`}>&times;</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
