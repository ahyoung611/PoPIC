package com.example.popic.popup.controller;

import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.PopupStoreSlot;
import com.example.popic.entity.entities.Review;
import com.example.popic.file.FileSave;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.service.ReviewImageService;
import com.example.popic.popup.dto.*;
import com.example.popic.popup.service.InquiryService;
import com.example.popic.popup.service.PopupReviewService;
import com.example.popic.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/popupStore")
@RequiredArgsConstructor
public class PopupController {
    private final PopupService popupService;
    private final PopupReviewService popupReviewService;
    private final ReviewImageService reviewImageService;
    private final InquiryService inquiryService;

    @GetMapping("/popupDetail")
    public ResponseEntity<PopupDTO> popupDetail(@RequestParam(name="id") Long id){
        PopupDTO popupDTO = popupService.findByIdWithImages(id);
        return ResponseEntity.ok(popupDTO);
    }

    @GetMapping("/popupSchedule")
    public ResponseEntity<List<PopupScheduleDTO>> getSchedule(@RequestParam(name = "popupId") Long id){
        List<PopupScheduleDTO> scheduleList = popupService.getScheduleById(id);
        return ResponseEntity.ok(scheduleList);
    }

    @GetMapping("/popupReview")
    public ResponseEntity<List<PopupReviewDTO>> getReview(@RequestParam(name = "popupId") Long id,
                                                           @RequestParam(name = "keyword", defaultValue = "")String keyword){
        List<PopupReviewDTO> reviewList = popupService.getReviewByIdAndKeyword(id, keyword);

        System.out.println("size: " + reviewList.size());
        return ResponseEntity.ok(reviewList);
    }

    @PostMapping("/popupReview")
    public ResponseEntity<PopupReviewDTO> saveReview(@ModelAttribute PopupReviewDTO popupReviewDTO,
                                                      @RequestParam(name = "file", required = false) MultipartFile file,
                                                      @RequestParam(name = "type") String type){
        String savedFileName = FileSave.fileSave(type,file);
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
    public ResponseEntity<List<ReviewReplyDTO>> getReviewReply(@RequestParam(name = "popupId") Long id){
        List<ReviewReplyDTO> reviewReplies = popupService.getReviewReply(id);

        return ResponseEntity.ok(reviewReplies);
    }

    @GetMapping("/inquiry")
    public ResponseEntity<List<InquiryDTO>> getInquiry(@RequestParam(name = "popupId")Long popupId){
        List<InquiryDTO> inquiryDTOList = inquiryService.findAllByPopupId(popupId);

        return ResponseEntity.ok(inquiryDTOList);
    }

    @PostMapping("/inquiry")
    public String createInquiry(@RequestBody InquiryDTO inquiryRequestDTO) {

        inquiryService.save(inquiryRequestDTO);

        return "문의가 등록되었습니다.";
    }

    @GetMapping("/{popupId}/schedules")
    public ResponseEntity<List<PopupStoreSchedule>> getMonthSchedules(
            @PathVariable Long popupId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(popupService.getSchedulesOfMonth(popupId, year, month));
    }

//    @GetMapping("/{popupId}/slots")
//    public ResponseEntity<List<PopupStoreSlot>> getSlotsOfDate(
//            @PathVariable Long popupId,
//            @RequestParam String date
//    ) {
//        return ResponseEntity.ok(popupService.getSlotsOfDate(popupId, date));
//    }

//    @PostMapping("/reservations")
//    public ResponseEntity<PopupReservationDTO> createReservation(
//            @RequestBody PopupReservationDTO req
//    ) {
//        return ResponseEntity.ok(popupService.reserve(req));
//    }
//
    @GetMapping("/slots")
    public ResponseEntity<List<SlotDTO>> getSlots(
            @RequestParam("popupId") Long popupId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(popupService.getSlots(popupId, date));
    }
}
