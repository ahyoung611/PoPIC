import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import "../../style/OnsiteTicket.css";

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
        const res = await fetch(`${URL}${path}`, { headers, ...init });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
            const msg = (await res.text().catch(() => "")) || `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return ct.includes("application/json") ? res.json() : res.text();
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

    useEffect(() => {
        if (!userId || !Number.isFinite(storeId) || !token) return;
        const c = new AbortController();
        loadOrCreate(c.signal);
        return () => c.abort();
    }, [userId, storeId, token]);

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
        <main className="onsite-container">
            <div className="onsite-card">
                <img src="/BeforeOnsite.png" alt="대기 일러스트" className="onsite-illust" />

                <p className="onsite-message">잠시만 기다려주세요!</p>
                <h2 className="onsite-title">{title}</h2>

                <div className="onsite-grid">
                    <div className="onsite-grid-item">
                        <span className="onsite-label">대기 번호</span>
                        <span className="onsite-value-red">{waiting.queueNumber}</span>
                    </div>
                    <div className="onsite-grid-item">
                        <span className="onsite-label">현재 대기 팀</span>
                        <span className="onsite-value-blue">{ahead}</span>
                    </div>
                </div>

                <Button
                    variant="primary"
                    color={isCanceled ? "gray" : "red"}
                    disabled={isCanceled}
                    onClick={onCancel}
                >
                    {isCanceled ? "취소됨" : "대기 취소"}
                </Button>
            </div>
        </main>
    );
};

export default OnsiteTicket;
