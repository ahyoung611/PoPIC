import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const OnsiteTicket = ({ userId: propUserId, storeId: propStoreId }) => {
    const { auth, getToken } = useAuth();
    const token = getToken?.();
    const location = useLocation();

    const stateStoreId = location?.state?.storeId ?? null;
    const stateWaitingId = location?.state?.waitingId ?? null;
    const statePopupName = location?.state?.popupName ?? null;

    const userId = useMemo(() => propUserId ?? auth?.user?.user_id ?? null, [propUserId, auth]);
    const storeId = useMemo(() => {
        const v = propStoreId ?? stateStoreId ?? Number.NaN;
        const n = Number(v);
        return Number.isFinite(n) ? n : Number.NaN;
    }, [propStoreId, stateStoreId]);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [waiting, setWaiting] = useState(null);
    const [ahead, setAhead] = useState(0);

    const waitingId = waiting?.id;

    const headers = useMemo(() => {
        const h = { "Content-Type": "application/json" };
        if (token) h.Authorization = `Bearer ${token}`;
        return h;
    }, [token]);

    const fetchJSON = async (path, init = {}) => {
        try {
            const res = await fetch(`${URL}${path}`, { headers, ...init });
            const ct = res.headers.get("content-type") || "";
            if (!res.ok) {
                const msg = (await res.text().catch(() => "")) || `HTTP ${res.status}`;
                throw new Error(msg);
            }
            return ct.includes("application/json") ? res.json() : res.text();
        } catch (e) {
            if (e?.name === "AbortError") return;
            throw e;
        }
    };

    const loadOrCreate = async (signal) => {
        setErr("");
        setLoading(true);
        try {
            if (!userId || !Number.isFinite(storeId) || !token) return;

            const list = await fetchJSON(`/waiting/user/${userId}`, { signal });
            const arr = Array.isArray(list) ? list : list?.content ?? [];

            let my =
                arr.find((w) => w.id === stateWaitingId) ||
                arr.find((w) => Number(w.storeId) === Number(storeId) && Number(w.status) === 1);

            if (!my) {
                try {
                    const created = await fetchJSON(
                        `/waiting/create?userId=${userId}&storeId=${storeId}`,
                        { method: "POST", signal }
                    );
                    my = created;
                } catch (ce) {
                    my = arr
                        .filter((w) => Number(w.storeId) === Number(storeId))
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                    if (!my) throw ce;
                }
            }

            setWaiting(my);
        } catch (e) {
            setErr(e.message || "오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAhead = async (id, signal) => {
        const data = await fetchJSON(`/waiting/${id}/ahead`, { signal });
        if (data) setAhead(data?.aheadTeams ?? 0);
    };

    // 초기 로딩
    useEffect(() => {
        if (!userId || !Number.isFinite(storeId) || !token) return;
        const c = new AbortController();
        loadOrCreate(c.signal);
        return () => c.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, storeId, token]);

    // 앞팀 수 폴링
    useEffect(() => {
        if (!waitingId || !token) return;
        const first = new AbortController();
        fetchAhead(waitingId, first.signal);

        const id = setInterval(() => {
            const c = new AbortController();
            fetchAhead(waitingId, c.signal);
        }, 10000);

        return () => {
            first.abort();
            clearInterval(id);
        };
    }, [waitingId, token]);

    const onCancel = async () => {
        if (!waitingId) return;
        try {
            const updated = await fetchJSON(`/waiting/${waitingId}/status?value=-1`, { method: "PATCH" });
            if (updated) setWaiting(updated);
        } catch (e) {
            alert(e.message || "취소 처리에 실패했습니다.");
        }
    };

    if (!userId || !Number.isFinite(storeId)) return <div>필수값이 없습니다.</div>;
    if (!token) return <div>인증 준비 중…</div>;
    if (loading) return <div>불러오는 중…</div>;
    if (err) return <div>{err}</div>;
    if (!waiting) return <div>대기 정보가 없습니다.</div>;

    const isCanceled = waiting.status === -1;
    const title = waiting.storeName || waiting.popup?.name || statePopupName || "팝업 스토어";

    return (
        <div>
            <h1>{title}</h1>
            <div>
                <div>대기 번호: {waiting.queueNumber}</div>
                <div>현재 대기 팀: {ahead}</div>
            </div>
            <button onClick={onCancel} disabled={isCanceled}>
                {isCanceled ? "취소됨" : "대기 취소"}
            </button>
        </div>
    );
};

export default OnsiteTicket;
