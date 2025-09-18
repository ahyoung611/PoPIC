// src/utils/kakaoLoader.js
let mapsPromise = null;

export function loadKakaoMaps(appKey) {
    if (typeof window !== "undefined" && window.kakao?.maps) return Promise.resolve();
    if (mapsPromise) return mapsPromise;

    mapsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        s.async = true;
        s.onload = () => window.kakao.maps.load(() => resolve());
        s.onerror = reject;
        document.head.appendChild(s);
    });

    return mapsPromise;
}
