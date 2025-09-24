import React, {useEffect, useMemo, useState} from "react";
import "../../style/popupReservation.css";
import {useAuth} from "../../context/AuthContext.jsx";

export default function PopupReservationCalendar({popup, value, onChange}) {
    const token = useAuth().getToken();

    const storeId = popup?.store_id;

    // 내부 상태 (부모 value로 초기화)
    const [cursor, setCursor] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(value?.date ?? null);
    const [selectedSlot, setSelectedSlot] = useState(value?.slot ?? null);

    // 서버 데이터
    const [schedules, setSchedules] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loadingCal, setLoadingCal] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // 달력 계산
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const firstDay = useMemo(() => new Date(y, m, 1), [y, m]);
    const startWeekday = firstDay.getDay();
    const lastDateNum = useMemo(() => new Date(y, m + 1, 0).getDate(), [y, m]);

    useEffect(() => {
        setSelectedDate(null);
        setSelectedSlot(null);
        setSchedules([]);
        setSlots([]);
    }, [storeId]);

    useEffect(() => {
        if (value) {
            setSelectedDate(value.date ?? null);
            setSelectedSlot(value.slot ?? null);
        }
    }, [value?.date, value?.slot]);

    // 월별 스케줄
    useEffect(() => {
        if (!storeId) return;
        (async () => {
            try {
                setLoadingCal(true);
                const res = await fetch(`http://localhost:8080/popupStore/popupSchedule?popupId=${storeId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        credentials: "include", // 쿠키 인증도 필요하다면
                    }
                );
                if (!res.ok) throw new Error("달력을 불러오지 못했습니다.");
                const data = await res.json();
                const filtered = (Array.isArray(data) ? data : []).filter(s => {
                    if (!s?.date) return false;
                    const d = new Date(s.date);
                    return d.getFullYear() === y && d.getMonth() === m;
                });
                setSchedules(filtered);
            } catch (e) {
                console.error(e);
                setSchedules([]);
            } finally {
                setLoadingCal(false);
            }
        })();
    }, [storeId, y, m]);

    // 날짜별 슬롯
    useEffect(() => {
        if (!storeId || !selectedDate) return;
        (async () => {
            try {
                setLoadingSlots(true);
                const res = await fetch(`http://localhost:8080/popupStore/slots?popupId=${storeId}&date=${selectedDate}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        credentials: "include", // 쿠키 인증도 필요하다면
                    }
                );
                if (!res.ok) throw new Error("시간을 불러오지 못했습니다.");
                const data = await res.json();
                setSlots(Array.isArray(data) ? data : []);
                setSelectedSlot(null); // 날짜 변경 시 슬롯 초기화
            } catch (e) {
                console.error(e);
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        })();
    }, [storeId, selectedDate]);

    // 선택 변경을 부모로 전달
    useEffect(() => {
        onChange?.({date: selectedDate, slot: selectedSlot});
    }, [selectedDate, selectedSlot, onChange]);

    // 예약 가능 날짜 집합
    const enabledDateSet = useMemo(() => {
        const set = new Set();
        for (const s of schedules) {
            if (s?.date) {
                const d = new Date(s.date);
                set.add(
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                        d.getDate()
                    ).padStart(2, "0")}`
                );
            }
        }
        return set;
    }, [schedules]);

    // 달력 그리드
    const weeks = [];
    let cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= lastDateNum; d++) cells.push(d);
    while (cells.length) weeks.push(cells.splice(0, 7));

    function isPastDate(dayNum) {
        const today = new Date();
        const d = new Date(y, m, dayNum, 23, 59, 59);
        return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function onClickDate(dayNum) {
        if (!dayNum) return;
        const d = `${y}-${String(m + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        if (!enabledDateSet.has(d)) return;
        setSelectedDate(d);
    }

    function kTime(tStr) {
        if (!tStr) return "";
        const [H, M] = tStr.split(":");
        const h = Number(H);
        const am = h < 12;
        const h12 = ((h + 11) % 12) + 1;
        return `${am ? "오전" : "오후"} ${h12}:${M}`;
    }

    return (
        <div className="pr-wrap">
            {/* Calendar */}
            <div className="pr-cal">
                <div className="pr-head">
                    <button className="pr-btn" onClick={() => setCursor(new Date(y, m - 1, 1))}>◀</button>
                    <div className="font-semibold">
                        {firstDay.toLocaleString("en-US", {month: "long"})} {y}
                    </div>
                    <button className="pr-btn" onClick={() => setCursor(new Date(y, m + 1, 1))}>▶</button>
                </div>

                {loadingCal ? (
                    <div className="pr-note">달력 불러오는 중…</div>
                ) : (
                    <>
                        <div className="pr-dow">
                            {"일월화수목금토".split("").map((d) => (
                                <div key={d}>{d}</div>
                            ))}
                        </div>
                        <div className="pr-grid">
                            {weeks.map((row, i) => (
                                <React.Fragment key={i}>
                                    {row.map((day, j) => {
                                        if (day === null) return <div key={`${i}-${j}`} style={{height: 36}}/>;
                                        const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                        const enabled = enabledDateSet.has(key) && !isPastDate(day);
                                        const selected = selectedDate === key;
                                        return (
                                            <button
                                                key={`${i}-${j}`}
                                                className={
                                                    selected
                                                        ? "pr-day selected"
                                                        : enabled
                                                            ? "pr-day enabled"
                                                            : "pr-day"
                                                }
                                                disabled={!enabled}
                                                onClick={() => onClickDate(day)}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Time Slots */}
            <div>
                <div className="mb-3" style={{fontWeight: 600}}>
                    {selectedDate ? `${selectedDate} 예약 가능 시간` : "날짜를 먼저 선택하세요"}
                </div>

                {loadingSlots ? (
                    <div className="pr-note">시간 불러오는 중…</div>
                ) : (
                    <div className="pr-slots">
                        {slots.length === 0 && (
                            <div className="pr-note" style={{gridColumn: "1 / -1"}}>
                                표시할 슬롯이 없습니다
                            </div>
                        )}
                        {slots.map((slot) => {
                            const full = (slot.reserved_count ?? slot.reservedCount) >= slot.capacity;

                            // 오늘 과거 시간 비활성화
                            let passed = false;
                            if (selectedDate) {
                                const startStr = (slot.start_time ?? slot.startTime) ?? "";
                                const hhmmss = startStr.length === 5 ? `${startStr}:00` : startStr;
                                const slotDate = new Date(`${selectedDate}T${hhmmss}`);
                                passed = slotDate < new Date();
                            }

                            const label = kTime(slot.start_time ?? slot.startTime);
                            const isSelected =
                                (selectedSlot?.slot_id ?? selectedSlot?.slotId) === (slot.slot_id ?? slot.slotId);

                            return (
                                <button
                                    key={slot.slot_id ?? slot.slotId}
                                    disabled={full || passed}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={
                                        isSelected ? "pr-slot sel"
                                            : (full || passed) ? "pr-slot full"
                                                : "pr-slot"
                                    }
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}