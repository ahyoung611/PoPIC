const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default async function apiRequest(url, options = {}) {
    const opts = { method: "GET", headers: {}, ...options };

    // JSON 바디인 경우에만 한 번만 stringify
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(opts.body);
    }

    const res = await fetch(url, opts);
    if (!res.ok) {
        // 서버 에러 메시지 보존
        const text = await res.text().catch(() => "");
        throw new Error(text || `${res.status} ${res.statusText}`);
    }
    // JSON 응답만 파싱
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}
