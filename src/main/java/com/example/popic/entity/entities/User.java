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
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;  // PK

    @Column(nullable = false, unique = true, length = 100)
    private String login_id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    private String password;

    @Column(length = 50)
    private String name;

    @Column(length = 20)
    private String phone_number;

    private Integer point = 0;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile user_profile;  // 프로필 FK

    @CreationTimestamp
    private LocalDateTime join_date;

    @UpdateTimestamp
    private LocalDateTime update_date;

    private LocalDateTime delete_date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ROLE role = ROLE.USER;  // USER, VENDOR, ADMIN

    @Column(nullable = false)
    private int status = 1; // 1: 정상, 0: 정지, -1: 탈퇴

}
