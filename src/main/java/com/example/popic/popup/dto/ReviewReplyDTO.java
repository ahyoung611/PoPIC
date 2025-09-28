package com.example.popic.popup.dto;

import com.example.popic.entity.entities.ReviewReply;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewReplyDTO {
    private Long reply_id;
    private Long review;
    private Long vendor;
    private String content;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public ReviewReplyDTO(ReviewReply reviewReply){
        this.reply_id = reviewReply.getReply_id();
        this.review = reviewReply.getReview().getReview_id();
        this.vendor = reviewReply.getVendor().getVendor_id();
        this.content = reviewReply.getContent();
        this.created_at = reviewReply.getCreated_at();
    }
}
