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
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long report_id; // PK

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 신고자

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private Board board; // 신고 대상 게시글

    @Column(name = "reason", nullable = false, length = 500)
    private String reason; // 신고 사유

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at; // 신고 생성일

    private int status = 1; // 1: 대기, -1: 처리 완료
}
