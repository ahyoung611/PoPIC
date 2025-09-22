const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function apiRequest(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    // const token = localStorage.getItem("accessToken");

    const config = {
        method: options.method || "GET",
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            // ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...(options.body && !isFormData && { body: JSON.stringify(options.body) }),
        ...(options.body && isFormData && { body: options.body }),
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // // 401 에러 시 토큰 만료 처리
        // if (response.status === 401) {
        //     console.warn("토큰이 만료되었습니다. 다시 로그인하세요.");
        //     localStorage.removeItem("accessToken");
        //     window.location.href = "/login";
        //     return;
        // }

        // JSON 변환
        const data = await response.json().catch(() => null);


        if (!response.ok) {
            throw new Error(data?.message || `API 요청 실패: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("API 요청 에러:", error);
        throw error;
    }
}

export default apiRequest;
