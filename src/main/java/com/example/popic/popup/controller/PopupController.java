package com.example.popic.popup.controller;

import com.example.popic.CustomUserPrincipal;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.Review;
import com.example.popic.file.FileSave;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.service.ReviewImageService;
import com.example.popic.popup.dto.*;
import com.example.popic.popup.service.InquiryService;
import com.example.popic.popup.service.PopupReviewService;
import com.example.popic.popup.service.PopupService;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/popupStore")
@RequiredArgsConstructor
public class PopupController {
    private final PopupService popupService;
    private final PopupReviewService popupReviewService;
    private final ReviewImageService reviewImageService;
    private final InquiryService inquiryService;
    private final VendorRepository vendorRepository;

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
        return ResponseEntity.ok(reviewList);
    }

    @PostMapping("/popupReview")
    public ResponseEntity<PopupReviewDTO> saveReview(@ModelAttribute PopupReviewDTO popupReviewDTO,
                                                      @RequestParam(name = "file", required = false) MultipartFile file,
                                                      @RequestParam(name = "type") String type){
        String savedFileName = null;
        if (file != null && !file.isEmpty()) {
            savedFileName = FileSave.fileSave(type, file);
        }
        Review review = popupReviewService.saveReview(popupReviewDTO);

        ReviewImageDTO reviewImageDTO = new ReviewImageDTO();
        reviewImageDTO.setReview(popupReviewDTO.getReview_id());
        reviewImageDTO.setSaved_name(savedFileName);
        reviewImageDTO.setOriginal_name(file.getOriginalFilename());
        reviewImageDTO.setReview(review.getReview_id());

        reviewImageService.saveReviewImage(reviewImageDTO);

        return ResponseEntity.ok(new PopupReviewDTO());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        // PageRequest 객체로 페이징 처리
        Pageable pageable = PageRequest.of(page, size,
                "desc".equalsIgnoreCase(direction)
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending());

        Page<PopupReviewDTO> reviewPage = popupReviewService.findReviewsByUserId(userId, pageable);

        return ResponseEntity.ok(reviewPage);
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

    @GetMapping("/inquiryReplies")
    public ResponseEntity<List<InquiryRepliyDTO>> getInquiryReply(@RequestParam(name = "popupId")Long popupId){
        List<InquiryRepliyDTO> replies = inquiryService.getAllReply(popupId);

        return ResponseEntity.ok(replies);
    }

    @PostMapping("/inquiry")
    public String createInquiry(@RequestBody InquiryDTO inquiryRequestDTO) {
        System.out.println(inquiryRequestDTO);
        inquiryService.save(inquiryRequestDTO);
        return "문의가 등록되었습니다.";
    }

    @PostMapping("/inquiryReply")
    public ResponseEntity<?> createReply( @RequestBody InquiryRepliyDTO reply,
                                          Authentication authentication) {

        // 로그인 벤더 정보 가져오기
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        System.out.println("principal" + principal);

        reply.setVendor(new VendorDTO(vendorRepository.findById(principal.getId()).orElse(null)));


        inquiryService.saveReply(reply);


        return ResponseEntity.ok().build();
    }

    @GetMapping("/{popupId}/schedules")
    public ResponseEntity<List<PopupStoreSchedule>> getMonthSchedules(
            @PathVariable Long popupId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(popupService.getSchedulesOfMonth(popupId, year, month));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<SlotDTO>> getSlots(
            @RequestParam("popupId") Long popupId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(popupService.getSlots(popupId, date));
    }

    // young 이달의 팝업
    @GetMapping("/monthly")
    public ResponseEntity<List<PopupDTO>> getMonthlyPopups() {
        List<PopupDTO> list = popupService.findMonthlyPopups();
        return ResponseEntity.ok(list != null ? list : new ArrayList<>());
    }

    // young 카테고리 팝업
    @GetMapping("/category")
    public ResponseEntity<List<PopupDTO>> getPopupsByCategory(
            @RequestParam(name = "category", required = false) String categoryId) {

        List<PopupDTO> list;
        if (categoryId == null || categoryId.isEmpty() || "all".equals(categoryId)) {
            list = popupService.findApprovedPopups();
        } else {
            try {
                Long catId = Long.parseLong(categoryId);
                list = popupService.findApprovedPopupsByCategoryId(catId);
            } catch (NumberFormatException e) {
                list = new ArrayList<>();
            }
        }
        return ResponseEntity.ok(list != null ? list : new ArrayList<>());
    }
}