// src/views/vendor/VendorMyPage.jsx
import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import ProfileForm from "../../components/commons/ProfileForm.jsx";
import ProfilePhoto from "../../components/commons/ProfilePhoto.jsx";
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx";
import "../../style/profileCard.css";
import "../../style/profilePhoto.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/* 벤더 상태 상수 */
const VENDOR_STATUS = {
  APPROVED: 1,
  PENDING: 2,
  REJECTED: 3,
  SUSPENDED: 0,
  CLOSED: -1,
};
const STATUS_BADGE = {
  [VENDOR_STATUS.APPROVED]: { text: "승인 완료", color: "blue" },
  [VENDOR_STATUS.PENDING]:  { text: "승인 대기", color: "gray" },
  [VENDOR_STATUS.REJECTED]: { text: "승인 반려", color: "red" },
  [VENDOR_STATUS.SUSPENDED]:{ text: "정지",     color: "gray" },
  [VENDOR_STATUS.CLOSED]:   { text: "운영 종료", color: "gray" },
};

/* 비밀번호 입력 + 보기/숨김 */
const PasswordField = React.memo(function PasswordField({
  label, value, onChange, placeholder, autoComplete = "new-password", name
}) {
  const [visible, setVisible] = React.useState(false);
  const inputRef = React.useRef(null);

  const toggle = () => {
    const el = inputRef.current;
    const pos = el ? el.selectionStart : null;
    setVisible(v => !v);
    requestAnimationFrame(() => {
      if (el && pos !== null) {
        try { el.setSelectionRange(pos, pos); } catch {}
        el.focus();
      }
    });
  };

  return (
    <div className="vp-field">
      <label className="vp-label">{label}</label>
      <div className="vp-input-container" style={{ position:"relative" }}>
        <input
          ref={inputRef}
          className="vp-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          name={name}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                   background:"transparent", border:0, padding:0, cursor:"pointer" }}
        >
          <img src={visible ? "/eye.png" : "/nonEye.png"} alt="" width={20} height={20} draggable="false" />
        </button>
      </div>
    </div>
  );
});

export default function VendorMyPage() {
  const { vendorId } = useParams();
  const { getToken } = useAuth();
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);

  /* 비밀번호 변경 UI 상태 */
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirmNewPassword:"" });
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const canChangePassword =
    typeof form?.password === "string" && form.password.trim().length > 0;

  useEffect(() => {
    if (!edit) {
      setPwOpen(false);
      setPwErr("");
      setPwForm({ currentPassword:"", newPassword:"", confirmNewPassword:"" });
    }
  }, [edit]);

  /* 벤더 정보 + 프로필 사진 로드 */
  useEffect(() => {
    if (!vendorId) return;
    (async () => {
      try {
        const v = await apiRequest(`/api/vendors/${vendorId}`, {}, token);
        let avatarUrl = null;

        if (v && v.avatarExists) {
          const photoResponse = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}/photo`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: "include",
          });
          if (photoResponse && photoResponse.ok) {
            const blob = await photoResponse.blob();
            avatarUrl = URL.createObjectURL(blob);
          } else {
            console.error("프로필 사진 응답 오류:", photoResponse);
          }
        }

        const merged = {
          ...v,
          status: v?.status != null ? Number(v.status) : null,
          avatarUrl,
        };
        setData(merged);
        setForm(merged);
      } catch (e) {
        console.error("벤더 정보를 불러오지 못했습니다.", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, vendorId]);

  /* 폼 스키마 */
  const vendorSchema = useMemo(() => ({
    fields: [
      { name:"manager_name", label:"이름",   required:true, readOnly:!edit },
      { name:"login_id",     label:"아이디", required:true, readOnly:true },
      { name:"brn",          label:"사업자 등록 번호", required:true, readOnly:true },
      { name:"phone_number", label:"전화번호", required:true, readOnly:!edit },
      { name:"vendor_name",  label:"업체명", required:true, readOnly:!edit },
    ]
  }), [edit]);

  const badgeMeta = STATUS_BADGE[data?.status] ?? { text:"상태 미정", color:"gray" };
  const badge = (
    <Button variant="label" color={badgeMeta.color} disabled style={{ cursor:"default" }}>
      {badgeMeta.text}
    </Button>
  );

  if (loading || !data || !form) return null;

  /* 저장 */
  const handleSave = async () => {
    const requiredFields = vendorSchema.fields.filter(f => f.required && !f.readOnly);
    for (const f of requiredFields) {
      if (!form[f.name] || String(form[f.name]).trim() === "") {
        alert(`${f.label}은(는) 필수 입력 항목입니다.`);
        return;
      }
    }
    try {
      const payload = {
        manager_name: form.manager_name,
        brn:          form.brn,
        phone_number: form.phone_number,
        vendor_name:  form.vendor_name,
      };
      await apiRequest(`/api/vendors/${vendorId}`, { method:"PUT", body: payload }, token);

      if (form.avatarRemoved) {
        await fetch(`${API_BASE_URL}/api/vendors/${vendorId}/photo`, {
          method:"DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials:"include",
        });
      }
      if (form.avatarFile) {
        const fd = new FormData();
        fd.append("file", form.avatarFile);
        const res = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}/photo`, {
          method:"POST",
          body: fd,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials:"include",
        });
        if (!res.ok) throw new Error(`사진 업로드 실패: ${res.status}`);
      }

      setEdit(false);
      console.log("프로필 수정 완료");
    } catch (e) {
      console.error("수정 실패", e);
      alert(e?.message || "수정에 실패했습니다.");
    }
  };

  /* 취소 → 서버 데이터로 롤백 */
  const handleCancel = async () => {
    try {
      const vendor = await apiRequest(`/api/vendors/${vendorId}`, {}, token);
      if (vendor?.avatarExists) {
        const photoResponse = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}/photo`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials:"include",
        });
        if (photoResponse?.ok) {
          const blob = await photoResponse.blob();
          vendor.avatarUrl = URL.createObjectURL(blob);
        }
      }
      const merged = { ...vendor, avatarUrl: vendor.avatarUrl ?? null };
      setData(merged);
      setForm(merged);
    } finally {
      setEdit(false);
    }
  };

  /* 비밀번호 클라이언트 검증 */
  const validateNewPasswordClient = (pwd, loginId) => {
    if (!pwd || pwd.length < 8 || pwd.length > 64) return "비밀번호는 8~64자여야 합니다.";
    if (/\s/.test(pwd)) return "비밀번호에 공백은 사용할 수 없습니다.";
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    if (!(hasLetter && hasDigit && hasSpecial)) return "문자, 숫자, 특수문자를 모두 포함해야 합니다.";
    if (/(.)\1\1/.test(pwd)) return "같은 문자를 3회 이상 연속 사용할 수 없습니다.";
    if (loginId && pwd.toLowerCase().includes(String(loginId).toLowerCase())) return "비밀번호에 아이디를 포함할 수 없습니다.";
    return "";
  };

  /* 비밀번호 변경 */
  const handleChangePassword = async () => {
    setPwErr("");

    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwErr("새 비밀번호와 확인 값이 일치하지 않습니다.");
      return;
    }
    const clientErr = validateNewPasswordClient(pwForm.newPassword, form?.login_id);
    if (clientErr) { setPwErr(clientErr); return; }

    try {
      setPwLoading(true);
      // ★ 토큰 전달, 204 No Content도 try 통과 → 성공으로 간주
      await apiRequest(
        `/api/vendors/${vendorId}/password`,
        {
          method: "POST", // 백엔드가 @PostMapping("/password")
          body: {
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword,
            confirmNewPassword: pwForm.confirmNewPassword,
          },
        },
        token // ★ 잊지 말고 토큰 전달
      );

      alert("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
      setPwOpen(false);
      setPwForm({ currentPassword:"", newPassword:"", confirmNewPassword:"" });
    } catch (e) {
      // 401/403/기타 에러 메시지 표시
      setPwErr(e?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="inner">
        <div className="profile-card">
          <div className="profile-card__head">
            <ProfilePhoto
              initialUrl={form?.avatarUrl}
              defaultUrl="/default-profile.png"
              size={104}
              readOnly={!edit}
              onChange={({ file, preview, removed }) =>
                setForm(p => ({
                  ...p,
                  avatarFile: file ?? p.avatarFile,
                  avatarUrl: preview,
                  avatarRemoved: removed ?? false,
                }))
              }
            />
            <div className="meta">
              <div className="profile-card__title">{form.vendor_name || "운영자"}</div>
              <div className="profile-card__sub">ID: {form.login_id}</div>
            </div>
            <div className="status-badge-slot">{badge}</div>
          </div>

          <div className="profile-card__form">
            <ProfileForm
              schema={vendorSchema}
              initialData={{ ...form }}
              onChange={(changed) => setForm(p => ({ ...p, ...changed }))}
              edit={edit}
              renderActions={() => (
                <div className="btn-box">
                  {!edit ? (
                    <Button color="red" onClick={() => setEdit(true)}>수정</Button>
                  ) : (
                    <>
                      <Button color="red" onClick={handleSave}>저장</Button>
                      <Button variant="outline" color="gray" onClick={handleCancel}>취소</Button>

                      {canChangePassword && (
                        <Button
                          variant="outline"
                          color="gray"
                          onClick={() => setPwOpen(o => !o)}
                        >
                          비밀번호 변경
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            />

            {pwOpen && canChangePassword && (
              <form
                className="password-section"
                style={{ marginTop: 12 }}
                onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}
                autoComplete="off"
              >
                <PasswordField
                  label="현재 비밀번호"
                  value={pwForm.currentPassword}
                  onChange={(v) => setPwForm(f => ({ ...f, currentPassword: v }))}
                  autoComplete="current-password"
                  name="current-password"
                />
                <PasswordField
                  label="새 비밀번호"
                  value={pwForm.newPassword}
                  onChange={(v) => setPwForm(f => ({ ...f, newPassword: v }))}
                  placeholder="8~64자 / 문자·숫자·특수 모두 포함"
                  autoComplete="new-password"
                  name="new-password"
                />
                <PasswordField
                  label="새 비밀번호 확인"
                  value={pwForm.confirmNewPassword}
                  onChange={(v) => setPwForm(f => ({ ...f, confirmNewPassword: v }))}
                  placeholder="다시 한 번 입력하세요"
                  autoComplete="new-password"
                  name="confirm-new-password"
                />

                {pwErr && <div className="vp-help" style={{ color:"red" }}>{pwErr}</div>}

                <div className="btn-box">
                  <Button color="red" disabled={pwLoading} type="submit">변경</Button>
                  <Button
                    variant="outline"
                    color="gray"
                    type="button"
                    onClick={() => { setPwOpen(false); setPwErr(""); }}
                  >
                    취소
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
