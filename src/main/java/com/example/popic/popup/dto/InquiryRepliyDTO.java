package com.example.popic.popup.dto;

import com.example.popic.entity.entities.InquiryReply;
import com.example.popic.vendor.dto.VendorDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InquiryRepliyDTO {
    private Long popup_id;
    private Long inquiry_id;
    private Long reply_id;
    private InquiryDTO inquiry;
    private VendorDTO vendor;
    private String content;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;


    public InquiryRepliyDTO(InquiryReply inquiryReply) {
        this.content = inquiryReply.getContent();
        this.created_at = inquiryReply.getCreated_at();
        this.inquiry = new InquiryDTO(inquiryReply.getInquiry());
        this.reply_id = inquiryReply.getReply_id();
        this.updated_at = inquiryReply.getUpdated_at();
        this.vendor = new VendorDTO(inquiryReply.getVendor());
        this.popup_id = inquiryReply.getPopup_store().getStore_id();
    }

}
