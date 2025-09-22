package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profile_id;

    @Column(nullable = false, length = 255)
    private String original_name;

    @Column(nullable = false, length = 255)
    private String saved_name;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Long getId() {
        return profile_id;
    }

}
