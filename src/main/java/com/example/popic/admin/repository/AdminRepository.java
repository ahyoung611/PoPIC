package com.example.popic.admin.repository;

import com.example.popic.entity.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    @Query("SELECT a FROM Admin a WHERE a.login_id = :loginId")
    Optional<Admin> findByLoginId(String loginId);
}
