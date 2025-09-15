package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long notice_id; // PK

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin; // 작성자 (관리자)

    @Column(name = "title", nullable = false, length = 200)
    private String title; // 제목

    @Column(name = "content", nullable = false, length = 5000)
    private String content; // 내용

    @Column(nullable = false)
    private int view_count = 0; // 조회수

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    private LocalDateTime updated_at;

    private LocalDateTime deleted_at;

    @Column(nullable = false)
    private int status = 1; // 1: 정상, -1: 삭제
}
