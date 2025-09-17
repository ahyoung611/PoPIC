package com.example.popic.image.service;

import com.example.popic.entity.entities.ReviewImage;
import com.example.popic.image.dto.ImageDTO;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.repository.ReviewImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewImageService {
    private final ReviewImageRepository reviewImageRepository;

    public ReviewImageDTO findById(Long imageId) {
        ReviewImage reviewImage = reviewImageRepository.findByImageId(imageId).orElse(null);

        return new ReviewImageDTO(reviewImage);
    }
}
