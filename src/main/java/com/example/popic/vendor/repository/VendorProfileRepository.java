package com.example.popic.vendor.repository;

import com.example.popic.entity.entities.VendorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// vendor_id로 벤더 프로필 조회
public interface VendorProfileRepository extends JpaRepository<VendorProfile, Long> {
    @Query("SELECT p FROM VendorProfile p WHERE p.vendor.vendor_id = :id")
    Optional<VendorProfile> findByVendorVendor_Id(@Param("id") Long id);
}
