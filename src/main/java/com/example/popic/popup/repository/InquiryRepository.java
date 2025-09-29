package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Inquiry;
import com.example.popic.popup.dto.InquiryDTO;
import com.example.popic.popup.dto.InquiryRepliyDTO;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    @Query("SELECT i FROM Inquiry i WHERE i.popup_store.store_id = :popupId")
    List<Inquiry> findAllByPopupId(Long popupId);

    @Query("SELECT i FROM Inquiry i WHERE i.popup_store.store_id = :popupId ORDER BY i.created_at DESC")
    Page<Inquiry> findAllByPopupStoreId(@Param("popupId") Long popupId, Pageable pageable);


    @Modifying
    @Transactional
    @Query("UPDATE Inquiry i SET i.title = :title, i.content = :content, i.visibility = :isPrivate WHERE i.inquiry_id = :id")
    void updateInquiry(Long id, String title, String content, Boolean isPrivate);
}
