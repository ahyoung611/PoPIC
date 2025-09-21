import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import ProfileForm from "../../components/commons/ProfileForm.jsx";
import ProfilePhoto from "../../components/commons/ProfilePhoto.jsx";
import apiRequest from "../../utils/apiRequest.js";
import "../../style/profileCard.css";
import "../../style/profilePhoto.css";

export default function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const [data, setData] = useState(null);
    const [form, setForm] = useState(null);

    // 상태 관리
    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const user = await apiRequest(`/api/users/${userId}`);
                const photo = await apiRequest(`/api/users/${userId}/photo`).catch(() => null);
                setData({ ...user, avatarUrl: photo?.url ?? null });
                setForm({ ...user, avatarUrl: photo?.url ?? null });
            } catch {
                alert("사용자 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    // 프로필 폼 스키마
    const userSchema = useMemo(() => ({
        fields: [
            { name: "name", label: "이름", readOnly: !edit, required: true },
            { name: "login_id", label: "아이디", readOnly: true },
            { name: "password_mask", label: "비밀번호", type: "password", readOnly: !edit },
            { name: "phone_number", label: "전화번호", readOnly: !edit },
            { name: "email", label: "이메일", readOnly: !edit },
        ]
    }), [edit]);

    // 저장/취소 처리
    const handleSave = async () => {
        try {
            const payload = {
                name: form.name,
                phone_number: form.phone_number,
                email: form.email,
                password: form.password,
            };

            await apiRequest(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // 사진 삭제
            if (form.avatarRemoved) {
                await apiRequest(`/api/users/${userId}/photo`, { method: "DELETE" });
            }

            // 사진 업로드
            if (form.avatarFile) {
                const fd = new FormData();
                fd.append("file", form.avatarFile);
                const res = await fetch(`/api/users/${userId}/photo`, { method: "POST", body: fd });
                if (!res.ok) throw new Error(`사진 업로드 실패: ${res.status}`);
            }

            // 최신값 반영
            const user = await apiRequest(`/api/users/${userId}`);
            const photo = await apiRequest(`/api/users/${userId}/photo`).catch(() => null);
            const merged = { ...user, avatarUrl: photo?.url ?? null };

            setData(merged);
            setForm(merged);
            setEdit(false);
            alert("프로필이 수정되었습니다.");
        } catch {
            alert("프로필 수정 실패");
        }
    };

    const handleCancel = async () => {
        try {
            const user = await apiRequest(`/api/users/${userId}`);
            const photo = await apiRequest(`/api/users/${userId}/photo`).catch(() => null);
            setData({ ...user, avatarUrl: photo?.url ?? null });
            setForm({ ...user, avatarUrl: photo?.url ?? null });
        } finally {
            setEdit(false);
        }
    };

    if (loading || !data || !form) return null;

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
                            <div className="profile-card__title">{form.name || "사용자"}</div>
                            <div className="profile-card__sub">ID: {form.login_id}</div>
                        </div>
                    </div>

                    <div className="profile-card__form">
                        <ProfileForm
                            schema={userSchema}
                            initialData={{
                                ...form,
                                password_mask: edit ? form.password || "" : form.password ? "*".repeat(form.password.length) : ""
                            }}
                            onChange={(changed) => setForm(p => ({ ...p, ...changed }))}
                            renderActions={() => (
                                <div style={{ display: "flex", gap: 8 }}>
                                    {!edit ? (
                                        <Button color="red" onClick={() => setEdit(true)}>수정</Button>
                                    ) : (
                                        <>
                                            <Button color="red" onClick={handleSave}>저장</Button>
                                            <Button variant="outline" color="gray" onClick={handleCancel}>취소</Button>
                                        </>
                                    )}
                                    {/* 탈퇴 버튼 */}
                                    <Button
                                        variant="outline"
                                        color="black"
                                        onClick={async () => {
                                            if (!confirm("정말 탈퇴하시겠습니까?")) return;
                                            try {
                                                await apiRequest(`/api/users/${userId}`, { method: "DELETE" });
                                                alert("회원 탈퇴 완료");
                                                navigate("/");
                                            } catch {
                                                alert("회원 탈퇴 실패");
                                            }
                                        }}
                                    >
                                        탈퇴하기
                                    </Button>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
