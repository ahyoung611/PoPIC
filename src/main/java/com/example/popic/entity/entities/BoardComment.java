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
public class BoardComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long comment_id; // PK

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private Board board; // 게시글

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 작성자

    @Column(name = "content", nullable = false, length = 1000)
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updated_at;

    private LocalDateTime deleted_at;

    private int status = 1; // 1: 정상 상태, -1: 삭제

    // 자기참조 관계: 대댓글
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private BoardComment parent; // 상위 댓글 (null이면 일반 댓글)

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardComment> replies = new ArrayList<>(); // 하위 댓글(대댓글)
}
