// 사용자 공통 (유저용) — 탈퇴 제거
export const statusLabelFromCode = (s) =>
    s === 1 ? "정상" :
        s === 0 ? "정지" :
            "알수없음";

export const statusCodeFromLabel = (label) =>
    label === "정상" ? 1 :
        label === "정지" ? 0 :
            null;

// 벤더 전용 매핑 (승인 대기/승인 반려 포함, 탈퇴 없음)
export const vendorStatusLabelFromCode = (s) =>
    s === 2 ? "승인 대기" :
        s === 1 ? "정상" :
            s === 0 ? "정지" :
                s === 3 ? "승인 반려" :
                    "알수없음";

export const vendorStatusCodeFromLabel = (label) =>
    label === "승인 대기" ? 2 :
        label === "정상" ? 1 :
            label === "정지" ? 0 :
                label === "승인 반려" ? 3 :
                    null;

// 검색 필터 옵션
export const filterOptionsUser = [
    { label: "전체", value: "" },
    { label: "정상", value: "normal" },
    { label: "정지(차단)", value: "blocked" },
];

// 벤더 전용 필터(탈퇴 없음, 라벨 정정)
export const filterOptionsVendor = [
    { label: "전체", value: "" },
    { label: "승인 대기", value: "2" },
    { label: "정상", value: "1" },
    { label: "정지", value: "0" },
    { label: "승인 반려", value: "3" },
];

// 상태 변경 드롭다운 옵션
export const manageOptionsUser = [
    { label: "정상", value: "정상" },
    { label: "정지", value: "정지" },
];

export const manageOptionsVendor = [
    { label: "승인 대기", value: "승인 대기" },
    { label: "정상", value: "정상" },
    { label: "정지", value: "정지" },
    { label: "승인 반려", value: "승인 반려" },
];

// (하위 호환) 기존 코드가 manageOptions를 임포트하면 유저용으로 동작
export const manageOptions = manageOptionsUser;
