package com.example.popic.entity.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VendorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profile_id;

    @Column(nullable = false, length = 255)
    private String original_name;

    @Column(nullable = false, length = 255)
    private String saved_name;

    @OneToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
}
