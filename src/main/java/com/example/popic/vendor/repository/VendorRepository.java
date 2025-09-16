package com.example.popic.vendor.repository;


import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;


public interface VendorRepository extends JpaRepository<Vendor, Long> {
//    boolean existsByLogin_id(String login_id);

}
