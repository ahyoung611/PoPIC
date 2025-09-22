package com.example.popic.user.repository;

import com.example.popic.entity.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// 유저 ID로 프로필 조회
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    @Query("SELECT p FROM UserProfile p WHERE p.user.user_id = :id")
    Optional<UserProfile> findByUser_Id(@Param("id") Long id);
}
