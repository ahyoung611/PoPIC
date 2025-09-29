import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/commons/Button.jsx";
import ProfileForm from "../../components/commons/ProfileForm.jsx";
import ProfilePhoto from "../../components/commons/ProfilePhoto.jsx";
import apiRequest from "../../utils/apiRequest.js";
import "../../style/profileCard.css";
import "../../style/profilePhoto.css";

/* 비밀번호 입력 필드 (보기/숨김 토글) */
function PasswordField({ label, value, onChange, placeholder, autoComplete = "new-password" }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="vp-field">
      <label className="vp-label">{label}</label>
      <div className="vp-input-container" style={{ position: "relative" }}>
        <input
          className="vp-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: 0,
            padding: 0,
            cursor: "pointer",
          }}
        >
          <img src={visible ? "/eye.png" : "/nonEye.png"} alt="" width={20} height={20} draggable="false" />
        </button>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { auth } = useAuth();
  const token = auth?.token;

  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  /* 내 ID 안전 추출 */
  const myId =
    auth?.user?.id ??
    auth?.user?.user_id ??
    auth?.user?.userId ??
    null;
  const myNumericId = myId != null && /^\d+$/.test(String(myId)) ? String(myId) : null;

  /* 내 페이지인지 판단 */
  const isMyPage =
    myNumericId != null && /^\d+$/.test(String(userId || "")) && String(myNumericId) === String(userId);

  /* 비밀번호 변경 경로 */
  const passwordPath = myNumericId
    ? `/api/users/${myNumericId}/password`
    : `/api/users/me/password`;

  useEffect(() => {
    if (!edit) {
      setPwOpen(false);
      setPwErr("");
      setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    }
  }, [edit]);

  /* 프런트 비밀번호 검증 */
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

    if (!isMyPage) {
      setPwErr("본인 계정에서만 변경할 수 있습니다.");
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwErr("동일한 비밀번호 입니다.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwErr("새 비밀번호와 확인 값이 일치하지 않습니다.");
      return;
    }
    const clientErr = validateNewPasswordClient(pwForm.newPassword, form?.login_id);
    if (clientErr) {
      setPwErr(clientErr);
      return;
    }

    setPwLoading(true);
    try {
      await apiRequest(
        `/api/users/${myNumericId}/password`,
        {
          method: "POST",
          body: {
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword,
            confirmNewPassword: pwForm.confirmNewPassword,
          },
        },
        token
      );

      alert("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (e) {
      if (String(e?.message || "").includes("403")) {
        setPwErr("권한이 없습니다. 본인 계정만 변경할 수 있습니다.");
      } else {
        setPwErr(e?.message || "비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setPwLoading(false);
    }
  };

  /* 사용자 정보 로드 */
  const fetchUserData = async () => {
    try {
      const user = await apiRequest(`/api/users/${userId}`, {}, token);

      let avatarUrl = null;
      if (user?.avatarExists) {
        const photoResponse = await fetch(`/api/users/${userId}/photo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (photoResponse?.ok) {
          const blob = await photoResponse.blob();
          avatarUrl = URL.createObjectURL(blob);
        }
      }

      const merged = { ...user, avatarUrl };
      setData(merged);
      setForm(merged);
    } catch (e) {
      console.error("사용자 정보를 불러오지 못했습니다.", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !token) return;
    fetchUserData();
  }, [userId, token]);

  /* 프로필 폼 스키마 */
  const userSchema = useMemo(
    () => ({
      fields: [
        { name: "name", label: "이름", required: true, readOnly: !edit },
        { name: "login_id", label: "아이디", required: true, readOnly: true },
        { name: "phone_number", label: "전화번호", required: true, readOnly: !edit },
        { name: "email", label: "이메일", required: true, readOnly: !edit },
      ],
    }),
    [edit]
  );

  if (loading || !data || !form) return null;

  /* ★ 여기 추가: 비밀번호 존재 여부 플래그 */
  const canChangePassword =
    typeof form?.password === "string" && form.password.trim().length > 0;

  /* 저장 */
  const handleSave = async () => {
    const requiredFields = userSchema.fields.filter((f) => f.required && !f.readOnly);
    for (const field of requiredFields) {
      if (!form[field.name] || String(form[field.name]).trim() === "") {
        alert(`${field.label}은(는) 필수 입력 항목입니다.`);
        return;
      }
    }

    try {
      const payload = {
        name: form.name,
        phone_number: form.phone_number,
        email: form.email,
      };

      await apiRequest(
        `/api/users/${userId}`,
        {
          method: "PUT",
          body: payload,
        },
        token
      );

      if (form.avatarRemoved) {
        await apiRequest(`/api/users/${userId}/photo`, { method: "DELETE" }, token);
      }

      if (form.avatarFile) {
        const fd = new FormData();
        fd.append("file", form.avatarFile);
        await apiRequest(`/api/users/${userId}/photo`, { method: "POST", body: fd }, token);
      }

      await fetchUserData();
      setEdit(false);
      alert("프로필이 성공적으로 저장되었습니다.");
    } catch (e) {
      console.error("프로필 수정 실패", e);
      alert(`프로필 수정 실패: ${e.message || "알 수 없는 오류가 발생했습니다."}`);
    }
  };

  /* 취소 → 서버 데이터로 롤백 */
  const handleCancel = async () => {
    try {
      await fetchUserData();
    } finally {
      setEdit(false);
    }
  };

  /* 회원 탈퇴 */
  const handleWithdrawal = async () => {
    const ok = window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!ok) return;
    try {
      await apiRequest(`/api/users/${userId}`, { method: "DELETE" }, token);
      navigate("/");
    } catch (e) {
      console.error("회원 탈퇴 실패", e);
      alert("회원 탈퇴에 실패했습니다. 다시 시도해 주세요.");
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
                setForm((p) => ({
                  ...p,
                  avatarFile: file ?? p.avatarFile,
                  avatarUrl: preview,
                  avatarRemoved: removed ?? false,
                }))
              }
            />
            <div className="meta">
              <div className="profile-card__title">{form.name || "사용자"}</div>
              <div className="profile-card__sub">ID: {form.login_id}</div>
            </div>
          </div>

          <div className="profile-card__form">
            <ProfileForm
              schema={userSchema}
              initialData={{ ...form }}
              onChange={(changed) => setForm((p) => ({ ...p, ...changed }))}
              edit={edit}
              renderActions={() => (
                <div className="btn-box">
                  {!edit ? (
                    <>
                      <Button color="red" onClick={() => setEdit(true)}>
                        수정하기
                      </Button>
                      <Button variant="outline" color="gray" onClick={handleWithdrawal}>
                        탈퇴하기
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button color="red" onClick={handleSave}>
                        저장
                      </Button>
                      <Button variant="outline" color="gray" onClick={handleCancel}>
                        취소
                      </Button>

                      {/* ★ 비밀번호가 있을 때만 노출 */}
                      {canChangePassword && (
                        <Button
                          variant="outline"
                          color="gray"
                          onClick={() => canChangePassword && setPwOpen((o) => !o)}
                        >
                          비밀번호 변경
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            />

            {/* ★ 폼도 canChangePassword 조건 추가 */}
            {pwOpen && canChangePassword && (
              <div className="password-section" style={{ marginTop: 12 }}>
                <div className="vp-field">
                  <PasswordField
                    label="현재 비밀번호"
                    value={pwForm.currentPassword}
                    onChange={(v) => setPwForm((f) => ({ ...f, currentPassword: v }))}
                    autoComplete="current-password"
                  />
                </div>

                <div className="vp-field">
                  <PasswordField
                    label="새 비밀번호"
                    value={pwForm.newPassword}
                    onChange={(v) => setPwForm((f) => ({ ...f, newPassword: v }))}
                    placeholder="8~64자 / 문자·숫자·특수 모두 포함"
                  />
                </div>

                <div className="vp-field">
                  <PasswordField
                    label="새 비밀번호 확인"
                    value={pwForm.confirmNewPassword}
                    onChange={(v) => setPwForm((f) => ({ ...f, confirmNewPassword: v }))}
                    placeholder="다시 한 번 입력하세요"
                  />
                </div>

                {pwErr && <div className="vp-help" style={{ color: "red" }}>{pwErr}</div>}

                <div className="btn-box">
                  <Button color="red" disabled={pwLoading || !isMyPage} onClick={handleChangePassword}>
                    변경
                  </Button>
                  {!isMyPage && (
                    <div className="vp-help" style={{ color: "red", marginLeft: 8 }}>
                      본인 계정에서만 변경할 수 있습니다.
                    </div>
                  )}
                  <Button
                    variant="outline"
                    color="gray"
                    onClick={() => {
                      setPwOpen(false);
                      setPwErr("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
