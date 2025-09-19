package com.example.popic.entity.entities;

public enum DayOfWeek {
    MONDAY("월"),
    TUESDAY("화"),
    WEDNESDAY("수"),
    THURSDAY("목"),
    FRIDAY("금"),
    SATURDAY("토"),
    SUNDAY("일");

    private final String kor;

    DayOfWeek(String kor) {
        this.kor = kor;
    }

    public String getKor() {
        return kor;
    }
}
