package com.example.popic.popup.controller;

import com.example.popic.entity.entities.Review;
import com.example.popic.file.FileSave;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.service.ReviewImageService;
import com.example.popic.popup.dto.*;
import com.example.popic.popup.service.PopupReviewService;
import com.example.popic.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/popupStore")
@RequiredArgsConstructor
public class PopupController {
    private final PopupService popupService;
    private final PopupReviewService popupReviewService;
    private final ReviewImageService reviewImageService;

    @GetMapping("/popupDetail")
    private ResponseEntity<PopupDTO> popupDetail(@RequestParam(name="id") Long id){
        PopupDTO popupDTO = popupService.findByIdWithImages(id);
        return ResponseEntity.ok(popupDTO);
    }

    @GetMapping("/popupSchedule")
    private ResponseEntity<List<PopupScheduleDTO>> getSchedule(@RequestParam(name = "popupId") Long id){
        List<PopupScheduleDTO> scheduleList = popupService.getScheduleById(id);
        return ResponseEntity.ok(scheduleList);
    }

    @GetMapping("/popupReview")
    private ResponseEntity<List<PopupReviewDTO>> getReview(@RequestParam(name = "popupId") Long id,
                                                           @RequestParam(name = "keyword", defaultValue = "")String keyword){
        List<PopupReviewDTO> reviewList = popupService.getReviewByIdAndKeyword(id, keyword);

        System.out.println("size: " + reviewList.size());
        return ResponseEntity.ok(reviewList);
    }

    @PostMapping("/popupReview")
    private ResponseEntity<PopupReviewDTO> saveReview(@ModelAttribute PopupReviewDTO popupReviewDTO,
                                                      @RequestParam(name = "file", required = false) MultipartFile file,
                                                      @RequestParam(name = "type") String type){
        String savedFileName = FileSave.FileSave(type,file);
        Review review = popupReviewService.saveReview(popupReviewDTO);

        ReviewImageDTO reviewImageDTO = new ReviewImageDTO();
        reviewImageDTO.setReview(popupReviewDTO.getReview_id());
        reviewImageDTO.setSaved_name(savedFileName);
        reviewImageDTO.setOriginal_name(file.getOriginalFilename());
        reviewImageDTO.setReview(review.getReview_id());

        reviewImageService.saveReviewImage(reviewImageDTO);

        return ResponseEntity.ok(new PopupReviewDTO());
    }

    @GetMapping("/popupReviewReply")
    private ResponseEntity<List<ReviewReplyDTO>> getReviewReply(@RequestParam(name = "popupId") Long id){
        List<ReviewReplyDTO> reviewReplies = popupService.getReviewReply(id);

        return ResponseEntity.ok(reviewReplies);
    }

}
