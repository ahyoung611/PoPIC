package com.example.popic.popup.dto;

import com.example.popic.entity.entities.DayOfWeek;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopupScheduleDTO {
    private Long schedule_id;
    private PopupStore popupStore;
    private DayOfWeek dayOfWeek; // Enum으로 저장
    private LocalDate date;
    private LocalTime start_time;
    private LocalTime end_time;

    // Entity → DTO 변환 생성자
    public PopupScheduleDTO(PopupStoreSchedule schedule) {
        this.schedule_id = schedule.getSchedule_id();
        this.dayOfWeek = schedule.getDayOfWeek() != null ? schedule.getDayOfWeek() : null;
        this.date = schedule.getDate();
        this.start_time = schedule.getStart_time();
        this.end_time = schedule.getEnd_time();
    }

}
