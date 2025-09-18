package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupReviewRepository extends JpaRepository<Review,Long> {
}
