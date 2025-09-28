import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParams, useLocation } from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import "../../style/OnsiteTicket.css";

const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";
const URL = (import.meta?.env?.VITE_API_BASE_URL?.trim()) || `http://${host}:8080`;

const OnsiteTicket = () => {
    const { auth, getToken } = useAuth();
    const token = getToken?.();

    const { waitingId } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const storeId = Number(query.get("storeId"));
    const statePopupName = query.get("popupName");

    const userId = auth?.user?.user_id;

    const [loading, setLoading] = useState(true);
    const [waiting, setWaiting] = useState(null); // 내 번호
    const [ahead, setAhead] = useState(0); // 앞 팀 계산

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

    // 내 대기표 불러오기 (userId로 가져온 뒤 waitingId 필터링)
    const loadWaiting = async (signal) => {
        setLoading(true);
        try {
            if (!userId || !Number.isFinite(storeId) || !token) return;

            const list = await fetchJSON(`/waiting/user/${userId}`, { signal });
            const arr = Array.isArray(list) ? list : list?.content ?? [];
            const my = arr.find((w) => w.id === Number(waitingId));

            setWaiting(my || null);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    // 내 앞에 몇 팀 있는지
    const fetchAhead = async (id, signal) => {
        const data = await fetchJSON(`/waiting/${id}/ahead`, { signal });
        if (data) setAhead(data?.aheadTeams ?? 0);
    };

    // 첫 로딩 시 대기 정보 불러오기
    useEffect(() => {
        if (!userId || !Number.isFinite(storeId) || !token || !waitingId) return;
        const c = new AbortController();
        loadWaiting(c.signal);
        return () => c.abort();
    }, [userId, storeId, token, waitingId]);

    // 10초마다 내 앞팀 수 확인(갱신)
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

    // 대기 취소
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
    if (!waiting) return <div>대기 정보가 없습니다.</div>;

    const isCanceled = waiting.status === -1;
    const title = waiting.storeName || waiting.popup?.name || statePopupName || "팝업 스토어";

    return (
        <main className="onsite-container">
            <div className="onsite-card">
                <img
                    src={waiting.callTime ? "/AfterOnsite.png" : "/BeforeOnsite.png"}
                    alt="대기 일러스트"
                    className="onsite-illust"
                />

                <p className="onsite-message">
                    {waiting.callTime ? "지금 입장해주세요!" : "잠시만 기다려주세요!"}
                </p>
                <h2 className="onsite-title">{title}</h2>

                {waiting.callTime ? (
                    <div className="onsite-qr-box">
                        <div className="onsite-qr-left">
                            <div className="onsite-label">대기 번호</div>
                            <div className="onsite-value-red">{waiting.queueNumber}</div>
                        </div>
                        <div className="onsite-qr-right">
                            <div className="onsite-qr-placeholder">QR</div>
                        </div>
                    </div>
                ) : (
                    <div className="onsite-grid-item">
                        <span className="onsite-label">현재 대기 팀</span>
                        <span className="onsite-value-blue">{ahead}</span>
                    </div>
                )}

                {!waiting.callTime && (
                    <Button
                        variant="primary"
                        color={isCanceled ? "gray" : "red"}
                        disabled={isCanceled}
                        onClick={onCancel}
                    >
                        {isCanceled ? "취소됨" : "대기 취소"}
                    </Button>
                )}
            </div>
        </main>
    );
};

export default OnsiteTicket;
