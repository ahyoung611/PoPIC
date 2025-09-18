// src/components/vendor/VendorPopupForm.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddressSelector from "./AddressSelector.jsx"; // 좌표 확인 알림 포함 버전
import "../../style/vendorPopup.css";
import Button from "../../components/commons/Button.jsx";

console.log("VendorPopupForm mounted", {
    KAKAO_JS_API_KEY: import.meta.env.VITE_KAKAO_JS_API_KEY
});

const KAKAO_JS_API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;
const CATEGORY_API = "/api/vendorPopups/categories";
const DAY_TO_ENUM = {
    "월":"MONDAY","화":"TUESDAY","수":"WEDNESDAY",
    "목":"THURSDAY","금":"FRIDAY","토":"SATURDAY","일":"SUNDAY"
};

// 렌더링용
const DAYS = Object.entries(DAY_TO_ENUM).map(([label, value]) => ({ label, value }));

export default function VendorPopupForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        store_id: null,
        store_name: "",
        description: "",
        vendor: null,
        categories: [],
        start_date: "",
        end_date: "",
        schedules: [],
        address: "",         // "시 구"
        address_detail: "",  // 상세주소
        latitude: null,
        longitude: null,
        price: "",           // ← 가격(원)
        images: [],
        join_date: null,
        update_date: null,
        delete_date: null,
        status: 2,
    });

    // UI 전용
    const [imageFiles, setImageFiles] = useState([]);
    const [categories, setCategories] = useState([{ id: 0, label: "전체" }]);
    const [categorySelect, setCategorySelect] = useState(0);
    const [openDays, setOpenDays] = useState(new Set());
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("19:00");
    const [capacityPerHour, setCapacityPerHour] = useState("");
    const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    // 카테고리 로딩
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await fetch(CATEGORY_API);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const list = await res.json(); // [{id,name}]
                if (!alive) return;
                setCategories([{ id: 0, label: "전체" }, ...list.map(c => ({ id: c.id, label: c.name }))]);
            } catch (e) {
                console.error("카테고리 로드 실패:", e);
            }
        })();
        return () => { alive = false; };
    }, []);

    // 주소 변경만 반영(좌표는 화면 비표시)
    const handleAddrChange = useCallback((v) => {
        setForm((prev) => {
            let changed = false;
            const next = { ...prev };
            const addr = v.addressString || "";
            const detail = v.detail || "";
            if (next.address !== addr) { next.address = addr; changed = true; }
            if (next.address_detail !== detail) { next.address_detail = detail; changed = true; }
            if (v.latitude != null && next.latitude !== v.latitude) { next.latitude = v.latitude; changed = true; }
            if (v.longitude != null && next.longitude !== v.longitude) { next.longitude = v.longitude; changed = true; }
            return changed ? next : prev;
        });
    }, []);

    const toggleDay = (d) => {
        setOpenDays((prev) => {
            const s = new Set(prev);
            s.has(d) ? s.delete(d) : s.add(d);
            return s;
        });
    };

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);
        setImageFiles(files);
    };

    // 컴포넌트 내부에서 직접 저장 + 이동
    const postPopup = async ({ dto, files }) => {
        // 유효성 간단 체크
        if (openDays.size === 0) { alert("운영 요일을 선택해 주세요."); return; }
        if (!startTime || !endTime || startTime >= endTime) { alert("운영 시간을 확인하세요."); return; }
        if (!capacityPerHour || Number(capacityPerHour) <= 0) { alert("시간당 인원을 입력해 주세요."); return; }

        const clean = {
            ...dto,
            start_date: dto.start_date || null,
            end_date: dto.end_date || null,
            price: dto.price === "" ? null : Number(dto.price),
            latitude: dto.latitude ?? null,
            longitude: dto.longitude ?? null,

            // 등록용 스케줄 생성 정보
            open_days: Array.from(openDays), // ["MONDAY",...]
            open_start_time: startTime,                        // "10:00"
            open_end_time: endTime,                            // "19:00"
            slot_minutes: 60,                                  // 한 슬롯 60분
            capacity_per_hour: Number(capacityPerHour),
        };

        const fd = new FormData();
        fd.append("dto", new Blob([JSON.stringify(clean)], { type: "application/json" }));
        (files || []).forEach(f => fd.append("files", f));

        const res = await fetch("/api/vendorPopups", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({ result:false, message:"JSON 파싱 실패" }));
        if (!res.ok || !json.result) {
            alert(`등록 실패: ${json.message || res.status}`);
            return;
        }
        navigate("/vendorPopups");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.store_name.trim()) return alert("팝업명을 입력해 주세요.");
        if (!form.start_date || !form.end_date) return alert("운영 기간을 입력해 주세요.");
        if (!form.address) return alert("시/구를 선택해 주세요.");
        if (!form.address_detail.trim()) return alert("상세 주소를 입력해 주세요.");
        if (form.latitude == null || form.longitude == null) return alert("좌표를 먼저 받아 주세요.");
        if (form.price !== "" && Number.isNaN(Number(form.price))) {
            return alert("가격은 숫자만 입력해 주세요.");
        }
        if (openDays.size === 0) return alert("운영 요일을 선택해 주세요.");
        if (!startTime || !endTime || startTime >= endTime) return alert("운영 시간을 확인하세요.");
        if (!capacityPerHour || Number(capacityPerHour) <= 0) return alert("시간당 인원을 입력해 주세요.");

        const dto = {
            ...form,
            categories: categorySelect === 0 ? [] : [categorySelect],

            // 여기서만 스케줄 관련 필드 생성
            open_days: Array.from(openDays),              // ["MONDAY", "TUESDAY", ...]
            open_start_time: startTime,                     // "10:00"
            open_end_time: endTime,                         // "19:00"
            capacity_per_hour: Number(capacityPerHour),     // 숫자화
            slot_minutes: 60,                               // 필요하면 상태로 빼서 조절
        };

        postPopup({ dto, files: imageFiles });
    };
    return (
        <div className="container">
            <div className="inner">
                <form className="vp-card" onSubmit={handleSubmit}>
                    <h1 className="vp-title">팝업 등록</h1>

                    {/* 이미지 */}
                    <div className="vp-field">
                        <label className="vp-label">이미지</label>
                        <label className="vp-input vp-filebox">
                            <input type="file" multiple accept="image/*" onChange={handleFiles} />
                            {imageFiles.length === 0 ? "파일을 선택하세요" : `${imageFiles.length}개 선택됨`}
                        </label>
                        {imageFiles.length > 0 && (
                            <ul className="vp-file-list">
                                {imageFiles.map((f, i) => (
                                    <li key={i} title={f.name}>{f.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 팝업명 */}
                    <div className="vp-field">
                        <label className="vp-label required">팝업명</label>
                        <input
                            className="vp-input"
                            value={form.store_name}
                            onChange={(e) => update("store_name", e.target.value)}
                            placeholder="예) 마포 시즌 팝업"
                            required
                        />
                    </div>

                    {/* 카테고리 (DB) */}
                    <div className="vp-field">
                        <label className="vp-label">카테고리</label>
                        <select
                            className="vp-select"
                            value={categorySelect}
                            onChange={(e) => setCategorySelect(Number(e.target.value))}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* 운영 기간 */}
                    <div className="vp-grid-2">
                        <div className="vp-field">
                            <label className="vp-label required">운영 기간 (시작)</label>
                            <input
                                type="date"
                                className="vp-input"
                                value={form.start_date}
                                onChange={(e) => update("start_date", e.target.value)}
                                required
                            />
                        </div>
                        <div className="vp-field">
                            <label className="vp-label required">운영 기간 (종료)</label>
                            <input
                                type="date"
                                className="vp-input"
                                value={form.end_date}
                                onChange={(e) => update("end_date", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* 시간당 인원 수 */}
                    <div className="vp-field">
                        <label className="vp-label">시간당 인원 수</label>
                        <input
                            className="vp-input"
                            inputMode="numeric"
                            value={capacityPerHour}
                            onChange={(e) => setCapacityPerHour(e.target.value)}
                            placeholder="예) 20"
                        />
                    </div>

                    {/* 장소 (시/구 셀렉트 + 상세주소 문자열)  */}
                    <div className="vp-field">
                        <label className="vp-label">장소</label>
                        <AddressSelector
                            kakaoAppKey={KAKAO_JS_API_KEY}
                            value={{
                                city: "",
                                district: "",
                                detail: "",
                                latitude: form.latitude,
                                longitude: form.longitude,
                            }}
                            onChange={handleAddrChange}
                            showCoords={false}
                            geocodeInline
                        />
                    </div>

                    {/* 운영 시간 */}
                    <div className="vp-field">
                        <label className="vp-label">운영 시간</label>
                        <div className="vp-days">
                            {DAYS.map((d) => (
                                <Button
                                    key={d.value}
                                    variant="filter"
                                    color="red"
                                    selected={openDays.has(d.value)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenDays(prev => {
                                            const s = new Set(prev);
                                            s.has(d.value) ? s.delete(d.value) : s.add(d.value);
                                            return s;
                                        });
                                    }}
                                >
                                    {d.label}
                                </Button>
                            ))}
                        </div>

                        <div className="vp-time-row">
                            <input
                                type="time"
                                className="vp-input"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <span className="vp-tilde">~</span>
                            <input
                                type="time"
                                className="vp-input"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 가격(원) */}
                    <div className="vp-field">
                        <label className="vp-label">가격(원)</label>
                        <input
                            className="vp-input"
                            inputMode="decimal"
                            placeholder="예) 10000"
                            value={form.price}
                            onChange={(e) => update("price", e.target.value.replace(/[^\d.]/g, ""))}
                        />
                    </div>

                    {/* 소개 */}
                    <div className="vp-field">
                        <label className="vp-label">팝업 소개</label>
                        <textarea
                            className="vp-textarea"
                            rows={8}
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                            placeholder="간단한 소개를 입력하세요"
                        />
                    </div>

                    {/* 액션 */}
                    <div className="vp-actions">
                        {/* 등록은 submit 유지 */}
                        <Button type="submit" variant="primary" color="red">
                            등록
                        </Button>

                        {/* 취소 → 바로 이동 */}
                        <Button
                            type="button"
                            variant="outline"
                            color="gray"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate("/vendorPopups", { replace: true });
                            }}
                        >
                            취소
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
