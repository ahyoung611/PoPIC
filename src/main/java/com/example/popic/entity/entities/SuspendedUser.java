package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuspendedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "suspended_id")
    private Long suspended_id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 정지 대상 유저

    @Column(nullable = false, length = 500)
    private String reason; // 정지 사유

    @Column(nullable = false)
    private LocalDateTime start_date; // 정지 시작일

    @Column(nullable = false)
    private LocalDateTime end_date; // 정지 종료일

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    private int status = 1; // 1: 정지 중, -1: 정지 해제
}
