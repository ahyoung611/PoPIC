package com.example.popic.popup.service;

import com.example.popic.entity.entities.*;
import com.example.popic.popup.dto.PopupReviewDTO;
import com.example.popic.popup.dto.ReviewReplyDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupReviewRepository;
import com.example.popic.popup.repository.ReviewReplyRepository;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.swing.*;

@Service
@RequiredArgsConstructor
public class PopupReviewService {
    private final PopupReviewRepository popupReviewRepository;
    private final UserRepository userRepository;
    private final PopupRepository popupRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final VendorRepository vendorRepository;

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
}
