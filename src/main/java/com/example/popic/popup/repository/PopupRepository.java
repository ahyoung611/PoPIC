package com.example.popic.popup.repository;


import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.Review;
import com.example.popic.entity.entities.ReviewReply;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

    @Query("SELECT p FROM PopupStore p WHERE p.status = 2 AND p.store_name LIKE CONCAT('%', :keyword, '%')")
    List<PopupStore> findPendingPopup(String keyword);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE PopupStore p SET p.status = :statusCode WHERE p.store_id = :popupId")
    void updatePopupStatus(Long popupId, int statusCode);

    @Query("SELECT p FROM PopupStore p WHERE p.status = 1 AND p.store_name LIKE CONCAT('%', :keyword, '%')")
    List<PopupStore> findApprovedPopup(String keyword);

    @Query("SELECT p FROM PopupStore p WHERE p.status = -1 AND p.store_name LIKE CONCAT('%', :keyword, '%')")
    List<PopupStore> findRejectedPopup(String keyword);

    // young 이달의 팝업
    @Query("SELECT p FROM PopupStore p " +
            "WHERE (p.start_date <= CURRENT_DATE AND p.end_date >= CURRENT_DATE) " +
            "AND p.status = 1")
    List<PopupStore> findByThisMonth();

    List<PopupStore> findAllByStatus(int status);

    // young 카테고리 팝업 (수정된 부분)
    @Query("SELECT DISTINCT p FROM PopupStore p JOIN p.categories c LEFT JOIN FETCH p.images i WHERE p.status = :status AND c.category_id = :categoryId")
    List<PopupStore> findAllByStatusAndCategory(@Param("status") int status, @Param("categoryId") Long categoryId);

}