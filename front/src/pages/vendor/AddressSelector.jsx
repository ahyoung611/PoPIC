import React, { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "../../utils/kakaoLoader.js";


// JSON GET 유틸(getJson) : fetch + content-type 검증 + JSON 파싱
async function getJson(url, { signal } = {}) {
    const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
        const text = await res.text().catch(() => "");
        throw new Error(`JSON 아님 @ ${url} (content-type: ${ct}, len=${text.length})`);
    }
    return res.json();
}

// 주소 값 정규화(normalize) : 문자열 트림, 위경도 수치 변환(null 안전)
function normalize(v) {
    return {
        city: typeof v?.city === "string" ? v.city.trim() : "",
        district: typeof v?.district === "string" ? v.district.trim() : "",
        detail: typeof v?.detail === "string" ? v.detail.trim() : "",
        latitude:
            v?.latitude == null || v?.latitude === ""
                ? null
                : Number.isFinite(Number(v.latitude)) ? Number(v.latitude) : null,
        longitude:
            v?.longitude == null || v?.longitude === ""
                ? null
                : Number.isFinite(Number(v.longitude)) ? Number(v.longitude) : null,
    };
}

// 얕은 동등 비교(shallowEqual) : city/district/detail/lat/lng 필드 기준 변경 여부 판단
function shallowEqual(a, b) {
    return (
        a.city === b.city &&
        a.district === b.district &&
        a.detail === b.detail &&
        Object.is(a.latitude, b.latitude) &&
        Object.is(a.longitude, b.longitude)
    );
}

// 주소 선택기 컴포넌트(AddressSelector) : 시/구 로딩 + 상세주소 → 좌표 변환 + 부모 onChange 통지
export default function AddressSelector({
                                            kakaoAppKey,
                                            value,
                                            onChange,
                                            showCoords = false,
                                            geocodeInline = true,
                                            basePath = "/api/vendors/0/popups",
                                        }) {
    // API 베이스 경로 상수(API_BASE) : /api/vendors/{vendorId}/popups
    const API_BASE = basePath;

    // 로컬 상태(cities/districts/입력필드/좌표)
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [city, setCity] = useState(value?.city || "");
    const [district, setDistrict] = useState(value?.district || "");
    const [detail, setDetail] = useState(value?.detail || "");
    const [lat, setLat] = useState(value?.latitude ?? null);
    const [lng, setLng] = useState(value?.longitude ?? null);

    // 간단 캐시 레퍼런스(cacheRef) : cities 1회 로딩, districtsByCity 메모이즈
    const cacheRef = useRef({ cities: undefined, districtsByCity: new Map() });

    // props.value → 내부 상태 동기화 이펙트 : 동일값은 무시하여 불필요 렌더 방지
    useEffect(() => {
        const nv = normalize(value);
        setCity((prev) => (prev === nv.city ? prev : nv.city));
        setDistrict((prev) => (prev === nv.district ? prev : nv.district));
        setDetail((prev) => (prev === nv.detail ? prev : nv.detail));
        setLat((prev) => (Object.is(prev, nv.latitude) ? prev : nv.latitude));
        setLng((prev) => (Object.is(prev, nv.longitude) ? prev : nv.longitude));
    }, [value]);

    // 도시 목록 로딩 이펙트 : 캐시 사용 + AbortController로 경쟁 상태 방지
    useEffect(() => {
        if (cacheRef.current.cities) {
            setCities(cacheRef.current.cities);
            return;
        }
        const ac = new AbortController();
        (async () => {
            try {
                const list = await getJson(`${API_BASE}/addresses/cities`, { signal: ac.signal });
                const arr = Array.isArray(list) ? list : [];
                cacheRef.current.cities = arr;
                setCities(arr);
            } catch (e) {
                if (e?.name === "AbortError") return;
                console.error("[cities] fetch 실패:", e);
                setCities([]);
            }
        })();
        return () => ac.abort();
    }, [API_BASE]);

    // 구 목록 로딩 이펙트 : city 변경 시 해당 구 목록 호출(캐시/Abort/정합성 유지)
    useEffect(() => {
        if (!city) {
            setDistricts([]);
            setDistrict((prev) => (prev === "" ? prev : ""));
            return;
        }

        const cached = cacheRef.current.districtsByCity.get(city);
        if (cached) {
            setDistricts(cached);
            if (district && !cached.includes(district)) setDistrict("");
            return;
        }

        const ac = new AbortController();
        (async () => {
            try {
                const list = await getJson(`${API_BASE}/addresses?city=${encodeURIComponent(city)}`, {
                    signal: ac.signal,
                });
                const arr = Array.isArray(list) ? list : [];
                cacheRef.current.districtsByCity.set(city, arr);
                setDistricts(arr);
                if (district && !arr.includes(district)) setDistrict("");
            } catch (e) {
                if (e?.name === "AbortError") return;
                console.error(`[districts:${city}] fetch 실패:`, e);
                setDistricts([]);
            }
        })();
        return () => ac.abort();
    }, [API_BASE, city, district]);

    // 부모 onChange 최신 참조 유지(onChangeRef)
    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    // 부모 onChange 조건부 호출 이펙트 : 값이 실제로 바뀐 경우에만 통지(shallowEqual)
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
        const prev = lastPayloadRef.current;
        const sameAsLast = prev && shallowEqual(prev, payload);
        if (!sameAsLast) {
            lastPayloadRef.current = payload;
            onChangeRef.current?.(payload);
        }
    }, [city, district, detail, lat, lng]);

    // lastPayload 초기화 이펙트(최초 동기화)
    useEffect(() => {
        lastPayloadRef.current = {
            ...normalize(value),
            addressString: [value?.city || "", value?.district || ""].filter(Boolean).join(" "),
        };
    }, [value]);

    // 카카오 지오코딩 핸들러(handleGeocode) : 상세주소로 좌표 조회 → lat/lng 갱신
    const handleGeocode = async () => {
        if (!kakaoAppKey) return alert("카카오 JS 키가 없습니다(.env 확인).");
        const full = [city, district, detail].filter(Boolean).join(" ");
        if (!city || !district || !detail.trim()) return alert("시/구/상세주소를 모두 입력하세요.");

        try {
            await loadKakaoMaps(kakaoAppKey);
            const { kakao } = window;
            new kakao.maps.services.Geocoder().addressSearch(full, (results, status) => {
                if (status === kakao.maps.services.Status.OK && results[0]) {
                    const { x, y } = results[0];
                    const nextLat = parseFloat(y);
                    const nextLng = parseFloat(x);
                    setLat(nextLat);
                    setLng(nextLng);
                    alert("주소 확인 완료");
                } else {
                    alert("좌표를 찾지 못했습니다. 주소를 확인하세요.");
                }
            });
        } catch {
            alert("카카오 지도 스크립트 로드 실패");
        }
    };

    return (
        <div className="vp-addr">
            <div className="vp-grid-2">
                <select className="vp-select" value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="" disabled>시를 선택하세요</option>
                    {(Array.isArray(cities) ? cities : []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <select className="vp-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    <option value="" disabled>구를 선택하세요</option>
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
