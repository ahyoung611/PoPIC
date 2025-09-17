package com.example.popic.popup.repository;


import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.Review;
import com.example.popic.entity.entities.ReviewReply;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;


public interface PopupRepository extends JpaRepository<PopupStore, Long> {

    @Query("SELECT p FROM PopupStore p LEFT JOIN FETCH p.images WHERE p.store_id = :id")
    Optional<PopupStore> findByIdWithImages(Long id);

    @Query("SELECT p FROM PopupStoreSchedule p WHERE p.popupStore.store_id = :id")
    List<PopupStoreSchedule> getScheduleByStoreId(Long id);

    @Query("SELECT r FROM Review r WHERE r.store.store_id = :id AND r.title like concat('%', :keyword, '%')")
    List<Review> getReviewByStoreIdAndKeyword(Long id, String keyword);

    @Query("SELECT rp FROM ReviewReply rp WHERE rp.review.store.store_id = :id")
    List<ReviewReply> getReviewReply(Long id);
}
