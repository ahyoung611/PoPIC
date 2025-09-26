package com.example.popic.popup.repository;

import com.example.popic.entity.entities.InquiryReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InquiryReplyRepository extends JpaRepository<InquiryReply, Long> {
    @Query("SELECT r FROM InquiryReply r WHERE r.inquiry.popup_store.store_id = :popupId")
    List<InquiryReply> getAllRepliy(Long popupId);

}
