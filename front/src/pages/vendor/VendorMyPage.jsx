import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import ProfileForm from "../../components/commons/ProfileForm.jsx";
import ProfilePhoto from "../../components/commons/ProfilePhoto.jsx";
import apiRequest from "../../utils/apiRequest.js";
import "../../style/profileCard.css";
import "../../style/profilePhoto.css";

// 운영 상태 관리
const STATUS_BADGE = {
    1: { text: "승인 완료", color: "blue" },
    2: { text: "승인 대기", color: "gray" },
    3: { text: "승인 반려", color: "red" },
    0: { text: "정지", color: "red" },
    [-1]: { text: "운영 종료", color: "gray" },
};

export default function VendorMyPage() {
    // 라우팅/상태 관리
    const { vendorId } = useParams();
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const [data, setData] = useState(null);
    const [form, setForm] = useState(null);

    // 데이터 로드 (벤더 기본 정보 + 프로필 사진)
    useEffect(() => {
        if (!vendorId) return;
        (async () => {
            try {
                const v = await apiRequest(`/api/vendors/${vendorId}`);
                const photo = await apiRequest(`/api/vendors/${vendorId}/photo`).catch(() => null);
                const merged = { ...v, avatarUrl: photo?.url ?? null };
                setData(merged);
                setForm(merged);
            } catch (e) {
                console.error("벤더 정보를 불러오지 못했습니다.", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [vendorId]);

    // 프로필 폼 스키마 : edit 상태에 따라 readOnly 제어
    const vendorSchema = useMemo(() => ({
        fields: [
            { name: "manager_name", label: "이름", required: true, readOnly: !edit },
            { name: "login_id", label: "아이디", readOnly: true },
            { name: "brn", label: "사업자 등록 번호", readOnly: true },
            { name: "password_mask", label: "비밀번호", type: "password",  readOnly: !edit },
            { name: "phone_number", label: "전화번호", readOnly: !edit },
            { name: "vendor_name", label: "업체명", readOnly: !edit },
        ]
    }), [edit]);

    const badgeMeta = STATUS_BADGE[data?.status] ?? { text: "상태 미정", color: "gray" };
    const badge = (
        <Button variant="label" color={badgeMeta.color} disabled style={{ cursor: "default" }}>
            {badgeMeta.text}
        </Button>
    );

    if (loading || !data || !form) return null;

    // 저장 핸들러
    const handleSave = async () => {
        try {
            // 폼 필드 업데이트
            const payload = {
                manager_name: form.manager_name,
                brn: form.brn,
                phone_number: form.phone_number,
                vendor_name: form.vendor_name,
                password: form.password,
            };

            console.log("저장 요청 payload:", payload);

            await apiRequest(`/api/vendors/${vendorId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: payload,
            });

            // 이미지 삭제 처리
            if (form.avatarRemoved) {
                console.log("🗑 프로필 사진 삭제 요청");
                await apiRequest(`/api/vendors/${vendorId}/photo`, { method: "DELETE" });
            }

            // 이미지 새로 선택 시 업로드
            if (form.avatarFile) {
                console.log("프로필 사진 업로드 요청:", form.avatarFile);

                const fd = new FormData();
                fd.append("file", form.avatarFile);

                const res = await fetch(`/api/vendors/${vendorId}/photo`, { method: "POST", body: fd });
                if (!res.ok) {
                    throw new Error(`사진 업로드 실패: ${res.status}`);
                }

                console.log("사진 업로드 성공");
            }

            setEdit(false);
            console.log("프로필이 수정되었습니다.");
        } catch (e) {
            console.error("수정 실패", e);
        }
    };

    // 취소 핸들러
    const handleCancel = async () => {
        try {
            const v = await apiRequest(`/api/vendors/${vendorId}`);
            const photo = await apiRequest(`/api/vendors/${vendorId}/photo`).catch(() => null);
            const merged = { ...v, avatarUrl: photo?.url ?? null };
            setData(merged);
            setForm(merged);
        } finally {
            setEdit(false);
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
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
