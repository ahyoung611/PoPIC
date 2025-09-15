package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_id")
    private Long board_id; // PK

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 작성자

    @Column(name = "title", nullable = false, length = 200)
    private String title; // 제목

    @Column(name = "content", nullable = false, length = 2000)
    private String content; // 내용

    @Column(name = "view_count", nullable = false)
    private Integer view_count = 0; // 조회수

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updated_at;

    private LocalDateTime deleted_at;

    private int status = 1; // 1: 정상 게시글, -1: 삭제 게시글, 0: 블라인드 게시글

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardImage> files = new ArrayList<>(); // 첨부파일 리스트

}
