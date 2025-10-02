package com.example.popic.popup.service;

import com.example.popic.entity.entities.*;
import com.example.popic.popup.dto.*;
import com.example.popic.popup.repository.*;
import jakarta.persistence.OptimisticLockException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PopupService {
    private final PopupRepository popupRepository;
    private final PopupStoreScheduleRepository scheduleRepository;
    private final PopupStoreSlotRepository storeSlotRepository;
    private final ReservationRepository reservationRepository;
    private final PopupReviewRepository popupReviewRepository;

    public PopupStore findById(Long id) {
        return popupRepository.findById(id).orElse(null);
    }

    public PopupDTO findByIdWithImages(Long id) {
        PopupStore popupStore = popupRepository.findByIdWithImages(id).orElse(null);

        return new PopupDTO(popupStore);
    }

    public List<PopupScheduleDTO> getScheduleById(Long id) {
       return popupRepository.getScheduleByStoreId(id).stream()
               .map(PopupScheduleDTO::new)
               .toList();
    }

    public Page<PopupReviewDTO> getReviewByIdAndKeyword(Long popupId, String keyword, Pageable pageable) {
        return popupReviewRepository.findByPopupIdAndKeyword(popupId, keyword, pageable)
                .map(PopupReviewDTO::new);
    }

    public List<ReviewReplyDTO> getReviewReply(Long id) {
        List<ReviewReply> reviewReplies = popupRepository.getReviewReply(id);
        return  reviewReplies.stream()
                .map(ReviewReplyDTO::new)
                .toList();
    }

    public List<PopupStoreSchedule> getSchedulesOfMonth(Long popupId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
        return scheduleRepository.findByPopupStoreIdAndDateBetween(popupId, start, end);
    }

    public List<SlotDTO> getSlots(Long popupId, LocalDate date) {
        return storeSlotRepository.findSlotsOfDate(popupId, date)
                .stream()
                .map(SlotDTO::new)
                .toList();
    }

    // young 이달의 팝업
    public List<PopupDTO> findMonthlyPopups() {
        List<PopupStore> entities = popupRepository.findByThisMonth();
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        return entities.stream().map(PopupDTO::new).collect(Collectors.toList());
    }

    // young 승인 완료 팝업
    public List<PopupDTO> findApprovedPopups() {
        List<PopupStore> entities = popupRepository.findAllByStatus(1);
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        return entities.stream().map(PopupDTO::new).collect(Collectors.toList());
    }

    // young 카테고리 팝업
    public List<PopupDTO> findApprovedPopupsByCategoryId(Long categoryId) {
        List<PopupStore> entities = popupRepository.findAllByStatusAndCategory(1, categoryId);
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        return entities.stream().map(PopupDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public void updateEndedStores(LocalDate today, int status) {
        popupRepository.updateEndedStores(today, status);
    }
}