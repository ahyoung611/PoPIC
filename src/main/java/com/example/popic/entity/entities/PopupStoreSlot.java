package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PopupStoreSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slot_id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private PopupStoreSchedule schedule;

    @Column(nullable = false)
    private int slot_order; // 1, 2, 3 ... (몇번째 시간대인지)

    @Column(nullable = false)
    private LocalTime start_time;

    @Column(nullable = false)
    private LocalTime end_time;

    @Column(nullable = false)
    private int capacity;

    private int reserved_count;

    @Version
    private Integer version;
}
