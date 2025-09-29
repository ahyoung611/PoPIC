package com.example.popic.popup.service;

import com.example.popic.CustomUserPrincipal;
import com.example.popic.entity.entities.*;
import com.example.popic.file.FileSave;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.repository.ReviewImageRepository;
import com.example.popic.image.service.ReviewImageService;
import com.example.popic.popup.dto.PopupReviewDTO;
import com.example.popic.popup.dto.ReviewReplyDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupReviewRepository;
import com.example.popic.popup.repository.ReviewReplyRepository;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.swing.*;

@Service
@RequiredArgsConstructor
public class PopupReviewService {
    private final PopupReviewRepository popupReviewRepository;
    private final UserRepository userRepository;
    private final PopupRepository popupRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final VendorRepository vendorRepository;
    private final ReviewImageService reviewImageService;

    public Review saveReview(PopupReviewDTO popupReviewDTO) {
        User user =  userRepository.findById(popupReviewDTO.getUserId()).orElse(null);
        PopupStore popup =  popupRepository.findById(popupReviewDTO.getPopupId()).orElse(null);
        Review review = Review.builder()
                .title(popupReviewDTO.getTitle())
                .content(popupReviewDTO.getContent())
                .review_id(popupReviewDTO.getReview_id())
                .user(user)
                .store(popup)
                .build();

        return popupReviewRepository.save(review);
    }

    public Page<PopupReviewDTO> findReviewsByUserId(Long userId, Pageable pageable) {
        return popupReviewRepository.findByUserId(userId, pageable)
                .map(PopupReviewDTO::new);
    }

    public void saveReply(ReviewReplyDTO replyDTO) {
        System.out.println(replyDTO);
        Review review = popupReviewRepository.findById(replyDTO.getReview()).orElse(null);
        Vendor vendor = vendorRepository.findById(replyDTO.getVendor()).orElse(null);

        ReviewReply reply = ReviewReply.builder()
                .content(replyDTO.getContent())
                .review(review)
                .vendor(vendor)
                .build();
        reviewReplyRepository.save(reply);
    }

    @Transactional
    public void updateReview(Long reviewId, PopupReviewDTO popupReviewDTO,
                             MultipartFile newFile, Long existingImageId, String type) {

        Review review = popupReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 유저 검증
        if (!review.getUser().getUser_id().equals(popupReviewDTO.getUserId())) {
            throw new IllegalStateException("해당 리뷰를 수정할 권한이 없습니다.");
        }

        review.setTitle(popupReviewDTO.getTitle());
        review.setContent(popupReviewDTO.getContent());

        // 이미지 처리
        if (newFile != null && !newFile.isEmpty()) {
            // 새 파일이 있으면 기존 이미지 삭제 후 새 이미지 저장
            reviewImageService.deleteImage(review.getReview_id());

            String savedImageId = FileSave.fileSave(type, newFile);

            ReviewImageDTO reviewImageDTO = new ReviewImageDTO();
            reviewImageDTO.setReview(reviewId);
            reviewImageDTO.setOriginal_name(newFile.getOriginalFilename());
            reviewImageDTO.setSaved_name(savedImageId);
            reviewImageService.saveReviewImage(reviewImageDTO);

        } else if (existingImageId != null) {
            // 기존 이미지 유지 → 아무것도 하지 않음

        } else {
            // 새 파일도 없고 기존 이미지도 없으면 기존 이미지 삭제
            if (review.getImages() != null && !review.getImages().isEmpty()) {
                reviewImageService.deleteImage(review.getReview_id());
            }
        }

        popupReviewRepository.save(review);
    }

    public void deleteReview(Long reviewId, CustomUserPrincipal principal) {
        Review review = popupReviewRepository.findById(reviewId).orElse(null);

        if(!review.getUser().getUser_id().equals(principal.getId())){
            throw new RuntimeException("사용자 불일치");
        }

        popupReviewRepository.delete(review);

    }


}
