package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Review;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PopupReviewRepository extends JpaRepository<Review,Long> {
    @Query("SELECT r FROM Review r WHERE r.user.user_id = :userId")
    Page<Review> findByUserId(@Param("userId") Long userId, Pageable pageable);
}
