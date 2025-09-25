package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Inquiry;
import com.example.popic.popup.dto.InquiryDTO;
import com.example.popic.popup.dto.InquiryRepliyDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    @Query("SELECT i FROM Inquiry i WHERE i.popup_store.store_id = :popupId")
    List<Inquiry> findAllByPopupId(Long popupId);


}
