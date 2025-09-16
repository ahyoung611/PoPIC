package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long image_id; // PK

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private Community community;

    @Column(nullable = false, length = 255)
    private String original_name;

    @Column(nullable = false, length = 255)
    private String saved_name;
}
