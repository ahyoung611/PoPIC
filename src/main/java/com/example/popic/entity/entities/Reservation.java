package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservation_id; // 예약번호 (PK)

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private PopupStore store;

    @ManyToOne
    @JoinColumn(name = "slot_id", nullable = false)
    private PopupStoreSlot slot;

    @Column(nullable = false)
    private int reservation_count = 1; // 예약자 수 최대 2명

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at; // 예약 생성 시각

    @Column(nullable = false)
    private int status = 1; // 1: 예약, -1: 예약 취소, 0: 참여 완료

    private BigDecimal deposit_amount = new BigDecimal("10000.00"); // 예약금

    @Column(length = 255)
    private String payment_key; // 결제 PG사에서 받은 키

    private LocalDateTime canceledAt; // 취소 시각
}
