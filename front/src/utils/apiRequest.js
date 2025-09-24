const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";


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
        credentials: "include",
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // 401 에러 시 토큰 만료 처리
        if (response.status === 401) {
            return null;
        }

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
