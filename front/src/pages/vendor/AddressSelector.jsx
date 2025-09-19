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
                                            geocodeInline = true,
                                        }) {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [city, setCity] = useState(value?.city || "");
    const [district, setDistrict] = useState(value?.district || "");
    const [detail, setDetail] = useState(value?.detail || "");
    const [lat, setLat] = useState(value?.latitude ?? null);
    const [lng, setLng] = useState(value?.longitude ?? null);

    // value가 바뀌면 내부 state도 동기화
    useEffect(() => {
        setCity(value?.city || "");
        setDistrict(value?.district || "");
        setDetail(value?.detail || "");
        setLat(value?.latitude ?? null);
        setLng(value?.longitude ?? null);
    }, [value?.city, value?.district, value?.detail, value?.latitude, value?.longitude]);

    const geocodeRequestedRef = useRef(false);

    // 도시 목록
    useEffect(() => {
        (async () => {
            try {
                const list = await getJson(`${API_BASE}/addresses/cities`);
                setCities(Array.isArray(list) ? list : []);
                // 수정화면 값 덮어쓰는 문제 방지
            } catch (e) {
                console.error(e);
                setCities([]);
            }
        })();
    }, []);

    // 구 목록
    useEffect(() => {
        if (!city) { setDistricts([]); return; }
        (async () => {
            try {
                const list = await getJson(`${API_BASE}/addresses?city=${encodeURIComponent(city)}`);
                const arr = Array.isArray(list) ? list : [];
                setDistricts(arr);
                // 현재 district가 목록에 없으면 비워둠 (사용자가 다시 선택)
                if (district && !arr.includes(district)) setDistrict("");
            } catch (e) {
                console.error(e);
                setDistricts([]);
            }
        })();
    }, [city]);

    // 부모 onChange는 값이 진짜 바뀐 경우에만 호출
    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const lastPayloadRef = useRef(null);
    useEffect(() => {
        const payload = {
            city,
            district,
            detail,
            latitude: lat,
            longitude: lng,
            addressString: [city, district].filter(Boolean).join(" "),
        };
        const same = JSON.stringify(lastPayloadRef.current) === JSON.stringify(payload);
        if (!same) {
            lastPayloadRef.current = payload;
            onChangeRef.current?.(payload);
        }
    }, [city, district, detail, lat, lng]);

    // 지오코딩 완료 후 1회만 알림
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
            geocodeRequestedRef.current = true;
            await loadKakaoMaps(kakaoAppKey);
            const { kakao } = window;
            new kakao.maps.services.Geocoder().addressSearch(full, (results, status) => {
                if (status === kakao.maps.services.Status.OK && results[0]) {
                    const { x, y } = results[0];
                    setLat(parseFloat(y));
                    setLng(parseFloat(x));
                } else {
                    geocodeRequestedRef.current = false;
                    alert("좌표를 찾지 못했습니다. 주소를 확인하세요.");
                }
            });
        } catch {
            geocodeRequestedRef.current = false;
            alert("카카오 지도 스크립트 로드 실패");
        }
    };

    return (
        <div className="vp-addr">
            <div className="vp-grid-2">
                <select className="vp-select" value={city} onChange={(e) => setCity(e.target.value)}>
                    {(Array.isArray(cities) ? cities : []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select className="vp-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    {(Array.isArray(districts) ? districts : []).map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div className="vp-addr-detail">
                <input
                    className="vp-input"
                    placeholder="상세주소를 입력해주세요."
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                />
                {geocodeInline && (
                    <button type="button" className="vp-link" onClick={handleGeocode}>
                        확인
                    </button>
                )}
            </div>

            {showCoords && <div className="vp-meta">좌표: {lat ?? "-"}, {lng ?? "-"}</div>}
        </div>
    );
}
