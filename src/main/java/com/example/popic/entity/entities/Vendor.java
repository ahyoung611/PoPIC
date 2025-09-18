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
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vendor_id;  // PK

    @Column(nullable = false, unique = true, length = 50)
    private String login_id;

    // young
    public void setLoginId(String loginId) {
        this.login_id = loginId;
    }

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String vendor_name;

    @Column(length = 50)
    private String manager_name;

    @Column(length = 20)
    private String phone_number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private VendorProfile profile;  // 프로필 FK

    @Column(nullable = false, unique = true, length = 20)
    private String brn;  // 사업자등록번호

    @CreationTimestamp
    private LocalDateTime join_date;

    @UpdateTimestamp
    private LocalDateTime update_date;

    private LocalDateTime delete_date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ROLE role = ROLE.VENDOR;  // 기본값 VENDOR

    @Column(nullable = false)
    private int status = 2; //2: 승인대기, 1: 정상, 0: 정지, -1: 탈퇴, 3: 가입 반려


}
