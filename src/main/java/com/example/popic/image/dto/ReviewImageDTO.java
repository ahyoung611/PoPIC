package com.example.popic.image.dto;


import com.example.popic.entity.entities.ReviewImage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Optional;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewImageDTO {
    private Long image_id; // PK
    private Long review;
    private String original_name; // 업로드된 원본 파일명
    private String saved_name;

    public ReviewImageDTO(ReviewImage image){
        this.image_id = image.getImage_id();
        this.review = image.getReview().getReview_id();
        this.original_name = image.getOriginal_name();
        this.saved_name = image.getSaved_name();
    }

}
