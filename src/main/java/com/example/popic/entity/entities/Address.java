package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long address_id;

    @Column(nullable = false, length = 50)
    private String city; // 시 예: 서울시

    @Column(nullable = false, length = 50)
    private String district; // 구, 군

    public Address(String city, String district) {
        this.city = city;
        this.district = district;
    }
}
