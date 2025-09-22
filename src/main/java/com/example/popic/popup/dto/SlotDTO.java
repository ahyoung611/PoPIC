package com.example.popic.popup.dto;

import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.PopupStoreSlot;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.aspectj.weaver.patterns.ConcreteCflowPointcut;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {
    private Long slot_id;
    private PopupScheduleDTO schedule;
    private int slot_order; // 1, 2, 3 ... (몇번째 시간대인지)
    private LocalTime start_time;
    private LocalTime end_time;
    private int capacity;
    private int reserved_count;
    private Integer version;

    public SlotDTO(PopupStoreSlot slot) {
        this.slot_id = slot.getSlot_id();
        this.schedule = new PopupScheduleDTO(slot.getSchedule());
        this.slot_order = slot.getSlot_order();
        this.start_time = slot.getStart_time();
        this.end_time = slot.getEnd_time();
        this.capacity = slot.getCapacity();
        this.reserved_count = slot.getReserved_count();
        this.version = slot.getVersion();
    }
}
