package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "waiting_number",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_wait_day_queue", columnNames = {"store_id", "waiting_date", "queue_number"}),
                @UniqueConstraint(name = "uk_wait_day_user", columnNames = {"store_id", "waiting_date", "user_id"})
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
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private PopupStore store;

    @Column(nullable = false)
    private Integer queueNumber; // 순번 (1,2,3...)

    @Column(nullable = false)
    private int status = 1; // 1: 대기, -1: 취소, 0: 입장완료

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime callTime;

    @Column(name = "waiting_date", nullable = false)
    private LocalDate waitingDate;
}
