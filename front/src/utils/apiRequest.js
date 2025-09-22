// src/utils/apiRequest.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 메모리 > 액세스 토큰
let ACCESS_TOKEN = null;
export function setAccessToken(t) { ACCESS_TOKEN = t || null; }
export function clearAccessToken() { ACCESS_TOKEN = null; }
export function getAccessToken() { return ACCESS_TOKEN; }

// 리프레시 쿠키로 액세스 재발급
async function refreshAccessToken() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include", // HttpOnly refresh 쿠키 전송
        });
        if (!res.ok) return false;
        const j = await res.json().catch(() => null);
        if (j?.token) {
            ACCESS_TOKEN = j.token;
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

async function apiRequest(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;

    const headers = new Headers(options.headers || {});
    if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const skipAuth = options.skipAuth === true;
    if (!skipAuth && ACCESS_TOKEN && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }

    const config = {
        method: options.method || "GET",
        headers,
        credentials: "include", // ★ refresh 쿠키를 위해 필수
        body: isFormData
            ? options.body
            : options.body
                ? JSON.stringify(options.body)
                : undefined,
    };

    // 최초 요청
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 401이면 refresh 시도 → 성공 시 한 번만 재시도
    if (response.status === 401 && !skipAuth) {
        const ok = await refreshAccessToken();
        if (ok) {
            headers.set("Authorization", `Bearer ${ACCESS_TOKEN}`);
            response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
        }
    }

    // JSON 변환
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        // 상태/본문을 가진 에러로 throw (기존 사용처와 호환)
        const err = new Error(data?.message || `API 요청 실패: ${response.status}`);
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

export default apiRequest;
