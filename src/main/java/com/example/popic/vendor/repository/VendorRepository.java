package com.example.popic.vendor.repository;


import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface VendorRepository extends JpaRepository<Vendor, Long> {
    @Query("select (count(v) > 0) from Vendor v where v.login_id = :loginId")
    boolean existsLoginId(@Param("loginId") String loginId);

    @Query("select (count(v) > 0) from Vendor v where v.brn = :brn")
    boolean existsBrn(@Param("brn") String brn);

    @Query("select v from Vendor v where v.login_id = :loginId")
    Optional<Vendor> findByLoginId(@Param("loginId") String loginId);

}
