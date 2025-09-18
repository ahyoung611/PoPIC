let loading;

export function loadKakaoMaps(appKey) {
    if (window.kakao?.maps) return Promise.resolve(window.kakao);
    if (loading) return loading;

    loading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
        s.async = true;
        s.onload = () => {
            window.kakao.maps.load(() => resolve(window.kakao));
        };
        s.onerror = () => reject(new Error("Kakao SDK load fail"));
        document.head.appendChild(s);
    });

    return loading;
}