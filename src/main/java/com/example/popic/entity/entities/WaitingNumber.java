package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "waiting_number",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_wait_day_queue", columnNames = {"store_id", "waiting_date", "queue_number"}),
                @UniqueConstraint(name = "uk_wait_day_user",  columnNames = {"store_id", "waiting_date", "user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WaitingNumber {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",  nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private PopupStore store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_waiting_number_schedule"))
    private PopupStoreSchedule schedule;

    @Column(nullable = false)
    private Integer queue_number; // 순번 (1,2,3...)

    @Column(nullable = false, length = 20)
    private int status =1; // 대기 상태 1: 대기, -1: 입장, 0: 취소

    @CreationTimestamp
    private LocalDateTime created_at; // 대기 신청 시각

    private LocalDateTime call_time; // 호출 시간

    @Column(name = "waiting_date", nullable = false)
    private LocalDate waiting_date;
}
