package com.example.popic.image.repository;


import com.example.popic.entity.entities.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ReviewImageRepository extends JpaRepository<ReviewImage,Integer> {

    @Query("SELECT img FROM ReviewImage img WHERE img.image_id = :imageId")
    Optional<ReviewImage> findByImageId(Long imageId);
}
