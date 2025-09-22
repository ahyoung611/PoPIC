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

    // 데이터 로드 (사용자 정보 + 프로필 사진)
    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const user = await apiRequest(`/api/users/${userId}`);

                let avatarUrl = null;
                // 사진이 존재할 때만 요청
                if (user.avatarExists) {
                    const photoResponse = await fetch(`/api/users/${userId}/photo`);
                    if (photoResponse.ok) {
                        const blob = await photoResponse.blob();
                        avatarUrl = URL.createObjectURL(blob);
                    }
                }

                const merged = {
                    ...user,
                    avatarUrl: avatarUrl,
                };

                setData(merged);
                setForm(merged);
            } catch (e) {
                console.error("사용자 정보를 불러오지 못했습니다.", e);
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
            { name: "password", label: "비밀번호", type: "password", readOnly: !edit },
            { name: "phone_number", label: "전화번호", readOnly: !edit },
            { name: "email", label: "이메일", readOnly: !edit },
        ]
    }), [edit]);

    if (loading || !data || !form) return null;

    // 저장 핸들러
    const handleSave = async () => {
        try {
            const payload = {
                name: form.name,
                phone_number: form.phone_number,
                email: form.email,
            };

            await apiRequest(`/api/users/${userId}`, {
                method: "PUT",
                body: payload,
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

            setEdit(false);
            console.log("프로필이 수정되었습니다.");
        } catch (e) {
            console.error("프로필 수정 실패", e);
        }
    };

    // 취소 핸들러
    const handleCancel = async () => {
        try {
            const user = await apiRequest(`/api/users/${userId}`);
            if (user.avatarExists) {
                const photoResponse = await fetch(`/api/users/${userId}/photo`);
                const blob = await photoResponse.blob();
                user.avatarUrl = URL.createObjectURL(blob);
            }
            const merged = { ...user, avatarUrl: user.avatarUrl ?? null };
            setData(merged);
            setForm(merged);
        } finally {
            setEdit(false);
        }
    };

    // 회원 탈퇴 핸들러
    const handleWithdrawal = async () => {
        const confirmWithdrawal = window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
        if (confirmWithdrawal) {
            try {
                await apiRequest(`/api/users/${userId}`, { method: "DELETE" });
                console.log("회원 탈퇴 완료");
                navigate("/");
            } catch (e) {
                console.error("회원 탈퇴 실패", e);
                alert("회원 탈퇴에 실패했습니다. 다시 시도해 주세요.");
            }
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
                            edit={edit}
                            renderActions={() => (
                                <div style={{ display: "flex", gap: 8 }}>
                                    {!edit ? (
                                        <>
                                        <Button color="red" onClick={() => setEdit(true)}>수정하기</Button>
                                            <Button variant="outline" color="black" onClick={handleWithdrawal}>탈퇴하기</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button color="red" onClick={handleSave}>저장</Button>
                                            <Button variant="outline" color="gray" onClick={handleCancel}>취소</Button>
                                        </>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}