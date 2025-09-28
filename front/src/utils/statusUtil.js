export const statusLabelFromCode = (s) => (s === 1 ? "정상" : s === 0 ? "정지" : s === -1 ? "탈퇴" : "선택");
export const statusCodeFromLabel = (label) =>
    label === "정상" ? 1 : label === "정지" ? 0 : label === "탈퇴" ? -1 : null;

export const filterOptionsUser = [
    { label: "전체", value: "" },
    { label: "정상", value: "normal" },
    { label: "정지(차단)", value: "blocked" },
    { label: "탈퇴", value: "deleted" },
];

export const filterOptionsVendor = filterOptionsUser;

export const manageOptions = [
    { label: "선택", value: "" },
    { label: "정상", value: "정상" },
    { label: "정지", value: "정지" },
    { label: "탈퇴", value: "탈퇴" },
];
