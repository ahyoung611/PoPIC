package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PopupStore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long store_id; // PK

    @Column(nullable = false, length = 100)
    private String store_name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor; // 운영자

    @ManyToMany
    @JoinTable(
            name = "popupstore_category",
            joinColumns = @JoinColumn(name = "store_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();

    @Column(nullable = false)
    private LocalDate start_date;

    @Column(nullable = false)
    private LocalDate end_date;

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL)
    private List<PopupStoreSchedule> schedules;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address; // 주소 FK

    @Column(length = 200)
    private String address_detail; // 상세 주소

    private Double latitude;  // KakaoMap 좌표
    private Double longitude;

    private BigDecimal price;

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime join_date;

    @UpdateTimestamp
    private LocalDateTime update_date;

    private LocalDateTime delete_date;

    private int status = 2; //2: 승인 대기, 1: 운영 시작 전 (승인 완료), 2: 운영 중, -1: 운영 종료, 0: 정지

}
