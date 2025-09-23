async function apiRequest(endpoint, options = {}, token) {
    const isFormData = options.body instanceof FormData;
    const config = {
        method: options.method || "GET",
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...(options.body && !isFormData && { body: JSON.stringify(options.body) }),
        ...(options.body && isFormData && { body: options.body }),
    };

    // 실제 요청을 함수로 빼서 재사용
    const doFetch = async () => {
        const res = await fetch(endpoint, config);
        const data = await res.json().catch(() => null);
        return { res, data };
    };

    try {
        let { res, data } = await doFetch();

        // if (res.status === 401 && refreshFn) {
        //     // 1) 리프레시 시도
        //     try {
        //         const newToken = await refreshFn();
        //         // 2) 토큰 바꿔서 재시도 (헤더 교체)
        //         config.headers = {
        //             ...(isFormData ? {} : { "Content-Type": "application/json" }),
        //             Authorization: `Bearer ${newToken}`,
        //             ...options.headers,
        //         };
        //         ({ res, data } = await doFetch());
        //     } catch (e) {
        //         // 리프레시 실패 → 로그인 페이지로
        //         console.warn("토큰 갱신 실패. 다시 로그인 해주세요.");
        //         localStorage.removeItem("auth");
        //         window.location.href = "/login";
        //         return;
        //     }
        // }

        // 기존코드
        /*
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // // 401 에러 시 토큰 만료 처리
        if (response.status === 401) {
            console.warn("토큰이 만료되었습니다. 다시 로그인하세요.");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return;
        }
        JSON 변환
        const data = await response.json().catch(() => null);
         */
        if (!res.ok) {
            throw new Error(data?.message || `API 요청 실패: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("API 요청 에러:", error);
        throw error;
    }
}

export default apiRequest;