import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadKakaoMaps } from "../../utils/kakaoLoader.js";
import apiRequest from "../../utils/apiRequest.js";

// 주소 객체 정규화 (공백 제거, 숫자 변환)
function normalize(v) {
    return {
        city: typeof v?.city === "string" ? v.city.trim() : "",
        district: typeof v?.district === "string" ? v.district.trim() : "",
        detail: typeof v?.detail === "string" ? v.detail : "",
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

// 주소 값이 변했는지 확인
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
    basePath = "/api/vendors/0/popups",
    token,
}) {
    const API_BASE = basePath;

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [city, setCity] = useState(value?.city || "");
    const [district, setDistrict] = useState(value?.district || "");
    const [detail, setDetail] = useState(value?.detail || "");
    const [lat, setLat] = useState(value?.latitude ?? null);
    const [lng, setLng] = useState(value?.longitude ?? null);
    const [kakaoReady, setKakaoReady] = useState(false);

    const cacheRef = useRef({ cities: undefined, districtsByCity: new Map() });
    const [isComposing, setIsComposing] = useState(false);

    const handleDetailChange = (e) => {
     setDetail(e.target.value); // 항상 값 반영
    };

    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = (e) => {
        setIsComposing(false);
    };

    // 카카오 SDK 로드
    useEffect(() => {
        loadKakaoMaps(kakaoAppKey)
            .then(() => setKakaoReady(true))
            .catch((err) => console.error("Kakao SDK 로딩 실패:", err));
    }, [kakaoAppKey]);

    // state 동기화
    useEffect(() => {
        const nv = normalize(value);
        setCity((prev) => (prev === nv.city ? prev : nv.city));
        setDistrict((prev) => (prev === nv.district ? prev : nv.district));
        setDetail((prev) => (prev === nv.detail ? prev : nv.detail));
        setLat((prev) => (Object.is(prev, nv.latitude) ? prev : nv.latitude));
        setLng((prev) => (Object.is(prev, nv.longitude) ? prev : nv.longitude));
    }, [value]);

    // 도시 목록 로딩
    useEffect(() => {
        if (cacheRef.current.cities) {
            setCities(cacheRef.current.cities);
            return;
        }
        const ac = new AbortController();
        (async () => {
            try {
                const list = await apiRequest(`${API_BASE}/addresses/cities`, { signal: ac.signal }, token);
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
    }, [API_BASE, token]);

    // 구 목록 로딩 (city 변경 시)
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
                const list = await apiRequest(`${API_BASE}/addresses?city=${encodeURIComponent(city)}`, { signal: ac.signal }, token);
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
    }, [API_BASE, city, district, token]);

    // 부모 onChange 최신 유지
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // 부모 onChange 호출 (값 변경 시)
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
        if (!prev || !shallowEqual(prev, payload)) {
            lastPayloadRef.current = payload;
            onChangeRef.current?.(payload);
        }
    }, [city, district, detail, lat, lng]);

    // 최초 동기화
    useEffect(() => {
        lastPayloadRef.current = {
            ...normalize(value),
            addressString: [value?.city || "", value?.district || ""].filter(Boolean).join(" "),
        };
    }, [value]);

    // 상세주소 → 좌표 변환
   const handleGeocode = useCallback(() => {
       if (
           !kakaoReady ||
           !window.kakao?.maps ||
           !window.kakao.maps.services
       ) {
           alert("카카오 지도 SDK가 아직 준비되지 않았습니다.");
           return;
       }

       if (!city || !district || !detail.trim()) {
           alert("시/구/상세주소를 모두 입력하세요.");
           return;
       }

       const full = `${city} ${district} ${detail.trim()}`;
       const geocoder = new window.kakao.maps.services.Geocoder(); // 안전하게 접근

       geocoder.addressSearch(full, (results, status) => {
           if (status === window.kakao.maps.services.Status.OK && results.length > 0) {
               const result = results[0];

               const hasDong = result.address?.region_3depth_name?.trim();
               const hasJibun = result.address?.main_address_no?.trim();
               const hasRoadAddr = result.road_address;

               if (!hasDong || (!hasJibun && !hasRoadAddr)) {
                   alert("상세 주소를 입력하세요 (동/지번/도로명 포함).");
                   return;
               }

               const nextLat = parseFloat(result.y);
               const nextLng = parseFloat(result.x);
               setLat(nextLat);
               setLng(nextLng);

               onChangeRef.current?.({
                   city,
                   district,
                   detail: detail.trim(),
                   latitude: nextLat,
                   longitude: nextLng,
                   addressString: [city, district].filter(Boolean).join(" "),
               });

               alert("주소 확인 완료");
           } else {
               alert("주소를 다시 확인하세요.");
           }
       });
   }, [city, district, detail, kakaoReady]);

    const triggerParentUpdate = () => {
        onChangeRef.current?.({
            city,
            district,
            detail: detail.trim(),
            latitude: lat,
            longitude: lng,
            addressString: [city, district].filter(Boolean).join(" "),
        });
    };

    return (
        <div className="vp-addr">
            <div className="vp-grid-2">
               <select
                 className="vp-select"
                 value={city}
                 onChange={(e) => {
                     const newCity = e.target.value;
                     setCity(newCity);
                     setDistrict("");   // 구 초기화
                     setDetail("");     // 상세주소 초기화
                 }}
               >
                    <option value="" disabled>시를 선택하세요</option>
                    {(Array.isArray(cities) ? cities : []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <select
                  className="vp-select"
                  value={district}
                  onChange={(e) => {
                      const newDistrict = e.target.value;
                      setDistrict(newDistrict);
                      setDetail("");    // 상세주소 초기화
                  }}
                >
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
               onChange={handleDetailChange}
               onCompositionStart={handleCompositionStart}
               onCompositionEnd={handleCompositionEnd}
               onBlur={() => triggerParentUpdate()}
               autoComplete="off"
               spellCheck={false}
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
