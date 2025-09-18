package com.example.popic.image.service;

import com.example.popic.entity.entities.Review;
import com.example.popic.entity.entities.ReviewImage;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.repository.ReviewImageRepository;
import com.example.popic.popup.repository.PopupReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class ReviewImageService {
    private final ReviewImageRepository reviewImageRepository;
    private final PopupReviewRepository popupReviewRepository;

    public ReviewImageDTO findById(Long imageId) {
        ReviewImage reviewImage = reviewImageRepository.findByImageId(imageId).orElse(null);

        return new ReviewImageDTO(reviewImage);
    }

    public void saveReviewImage(ReviewImageDTO reviewImageDTO) {
        Review review = popupReviewRepository.findById(reviewImageDTO.getReview()).orElse(null);

        ReviewImage reviewImage = ReviewImage.builder()
                .saved_name(reviewImageDTO.getSaved_name())
                .original_name(reviewImageDTO.getOriginal_name())
                .review(review)
                .build();

        reviewImageRepository.save(reviewImage);
    }
}
