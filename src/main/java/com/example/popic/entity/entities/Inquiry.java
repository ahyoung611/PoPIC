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
@Builder
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inquiry_id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 문의 작성자

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private PopupStore popup_store; // 대상 팝업스토어

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;

    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InquiryReply> replies = new ArrayList<>(); // 답변 리스트

    @Column(name = "status", nullable = false)
    private int status =1; // 1: 대기, -1: 답변완료, 0: 블라인드

    private Boolean visibility = true; // 문의 공개/비공개

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updated_at;

    private LocalDateTime deleted_at;

}
