import React, { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "../../utils/kakaoLoader.js";

const API_BASE = "/api/vendorPopups";

async function getJson(url, { signal } = {}) {
    const res = await fetch(url, {
        signal,
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
        const text = await res.text().catch(() => "");
        throw new Error(`JSON 아님 @ ${url} (content-type: ${ct}, len=${text.length})`);
    }
    return res.json();
}

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
function shallowEqual(a, b) {
    return (
        a.city === b.city &&
        a.district === b.district &&
        a.detail === b.detail &&
        Object.is(a.latitude, b.latitude) &&
        Object.is(a.longitude, b.longitude)
    );
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

    // 간단 캐시 (중복요청 방지)
    const cacheRef = useRef({ cities: undefined, districtsByCity: new Map() });

    // props.value → 내부 state 동기화 (동일값 가드)
    useEffect(() => {
        const nv = normalize(value);
        setCity((prev) => (prev === nv.city ? prev : nv.city));
        setDistrict((prev) => (prev === nv.district ? prev : nv.district));
        setDetail((prev) => (prev === nv.detail ? prev : nv.detail));
        setLat((prev) => (Object.is(prev, nv.latitude) ? prev : nv.latitude));
        setLng((prev) => (Object.is(prev, nv.longitude) ? prev : nv.longitude));
    }, [value]);

    const geocodeRequestedRef = useRef(false);

    // 도시 목록: Abort + 캐시
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
    }, []);

    // 구 목록: city 변경 시 Abort + 캐시 + 동일값 가드
    useEffect(() => {
        if (!city) {
            setDistricts([]);
            setDistrict((prev) => (prev === "" ? prev : ""));
            return;
        }

        const cached = cacheRef.current.districtsByCity.get(city);
        if (cached) {
            setDistricts(cached);
            if (district && !cached.includes(district)) {
                setDistrict((prev) => (prev === "" ? prev : ""));
            }
            return;
        }

        const ac = new AbortController();
        (async () => {
            try {
                const list = await getJson(
                    `${API_BASE}/addresses?city=${encodeURIComponent(city)}`,
                    { signal: ac.signal }
                );
                const arr = Array.isArray(list) ? list : [];
                cacheRef.current.districtsByCity.set(city, arr);
                setDistricts(arr);
                if (district && !arr.includes(district)) {
                    setDistrict((prev) => (prev === "" ? prev : ""));
                }
            } catch (e) {
                if (e?.name === "AbortError") return;
                console.error(`[districts:${city}] fetch 실패:`, e);
                setDistricts([]);
            }
        })();
        return () => ac.abort();
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
        const prev = lastPayloadRef.current;
        const sameAsLast = prev && shallowEqual(prev, payload);
        if (!sameAsLast) {
            lastPayloadRef.current = payload;
            onChangeRef.current?.(payload);
            }
        }, [city, district, detail, lat, lng]);

    useEffect(() => {
        lastPayloadRef.current = {
            ...normalize(value),
            addressString: [value?.city || "", value?.district || ""].filter(Boolean).join(" "),
        }
    }, [value]);

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
                    const { x, y, address_name } = results[0];
                    const nextLat = parseFloat(y);
                    const nextLng = parseFloat(x);
                    const prevLat = lat;
                    const prevLng = lng;
                    const same =
                        prevLat != null &&
                        prevLng != null &&
                        Object.is(prevLat, nextLat) &&
                        Object.is(prevLng, nextLng);

                    setLat(nextLat);
                    setLng(nextLng);

                    geocodeRequestedRef.current = false;
                    alert(
                        same
                            ? `주소 확인 완료`
                            : `주소 변경 완료 `
                    );
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