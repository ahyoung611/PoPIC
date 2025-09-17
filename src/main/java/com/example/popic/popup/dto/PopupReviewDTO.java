package com.example.popic.popup.dto;

import com.example.popic.entity.entities.*;
import com.example.popic.user.dto.UserDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopupReviewDTO {
    private Long review_id;
    private UserDTO user; // 작성자
    private PopupDTO store;
    private String title;
    private String content;
    private LocalDateTime createdAt; // 작성일
    private LocalDateTime updatedAt; // 수정일
    private List<Long> images = new ArrayList<>(); // 리뷰 이미지 리스트


    // Entity → DTO 변환 생성자
    public PopupReviewDTO(Review review) {
        this.review_id = review.getReview_id();
        this.title = review.getTitle();
        this.content = review.getContent();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
        this.user = new UserDTO(review.getUser());
        this.store = new PopupDTO(review.getStore());
        this.images = review.getImages().stream().map(ReviewImage::getImage_id).collect(Collectors.toList());
    }
}
