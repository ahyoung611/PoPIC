import React, { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "../../utils/kakaoLoader.js";

const API_BASE = "/api/vendorPopups";

async function getJson(url) {
    const res = await fetch(url);
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!ct.includes("application/json")) throw new Error("JSON 아님");
    return res.json();
}

export default function AddressSelector({
                                            kakaoAppKey,
                                            value,
                                            onChange,
                                            showCoords = false,
                                            geocodeInline = true
                                        }) {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [city, setCity] = useState(value?.city || "");
    const [district, setDistrict] = useState(value?.district || "");
    const [detail, setDetail] = useState(value?.detail || "");
    const [lat, setLat] = useState(value?.latitude ?? null);
    const [lng, setLng] = useState(value?.longitude ?? null);

    // 확인 버튼을 누른 뒤 좌표가 세팅되면 그때만 alert 띄우기 위한 플래그
    const geocodeRequestedRef = useRef(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await getJson(`${API_BASE}/addresses/cities`);
                const list = Array.isArray(data) ? data : (data?.cities || []);
                setCities(list || []);
                if (!city && list?.length) setCity(list[0]);
            } catch (e) {
                setCities([]);
                console.error(e);
            }
        })();
    }, []);

    useEffect(() => {
        if (!city) return;
        (async () => {
            try {
                const data = await getJson(`${API_BASE}/addresses?city=${encodeURIComponent(city)}`);
                const list = Array.isArray(data) ? data : (data?.districts || []);
                setDistricts(list || []);
                if (!list?.includes(district)) setDistrict(list?.[0] || "");
            } catch (e) {
                setDistricts([]);
                console.error(e);
            }
        })();
    }, [city]);

    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    useEffect(() => {
        const addressString = [city, district].filter(Boolean).join(" ");
        const payload = { city, district, detail, latitude: lat, longitude: lng, addressString };
        onChangeRef.current?.(payload);
    }, [city, district, detail, lat, lng]);

    // 좌표 세팅이 끝난 직후 1회만 알림
    useEffect(() => {
        if (geocodeRequestedRef.current && lat != null && lng != null) {
            geocodeRequestedRef.current = false;
            alert("확인되었습니다.");
        }
    }, [lat, lng]);

    const handleGeocode = async () => {
        if (!kakaoAppKey) return alert("카카오 JS 키가 없습니다(.env 확인).");
        const full = [city, district, detail].filter(Boolean).join(" ");
        if (!city || !district || !detail.trim()) return alert("시/구/상세주소를 모두 입력하세요.");

        try {
            geocodeRequestedRef.current = true; // ← 확인 버튼 누름 표시
            await loadKakaoMaps(kakaoAppKey);
            const { kakao } = window;
            new kakao.maps.services.Geocoder().addressSearch(full, (results, status) => {
                if (status === kakao.maps.services.Status.OK && results[0]) {
                    const { x, y } = results[0];
                    setLat(parseFloat(y));
                    setLng(parseFloat(x));
                    // 알림은 위 useEffect에서 한 번만 발생
                } else {
                    geocodeRequestedRef.current = false; // 실패 시 플래그 해제
                    alert("좌표를 찾지 못했습니다. 주소를 확인하세요.");
                }
            });
        } catch (e) {
            geocodeRequestedRef.current = false;
            alert("카카오 지도 스크립트 로드 실패");
        }
    };

    return (
        <div className="vp-addr">
            <div className="vp-grid-2">
                <select className="vp-select" value={city} onChange={(e) => setCity(e.target.value)}>
                    {(Array.isArray(cities) ? cities : []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="vp-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    {(Array.isArray(districts) ? districts : []).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div className="vp-addr-detail">
                <input
                    className="vp-input"
                    placeholder=""
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                />
                {geocodeInline && (
                    <button type="button" className="vp-link" onClick={handleGeocode}>
                        확인
                    </button>
                )}
            </div>

            {showCoords && (
                <div className="vp-meta">좌표: {lat ?? "-"}, {lng ?? "-"}</div>
            )}
        </div>
    );
}
