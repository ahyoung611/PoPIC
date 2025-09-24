package com.example.popic.popup.service;

import com.example.popic.entity.entities.*;
import com.example.popic.popup.dto.*;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupStoreScheduleRepository;
import com.example.popic.popup.repository.PopupStoreSlotRepository;
import com.example.popic.popup.repository.ReservationRepository;
import jakarta.persistence.OptimisticLockException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PopupService {
    private final PopupRepository popupRepository;
    private final PopupStoreScheduleRepository scheduleRepository;
    private final PopupStoreSlotRepository storeSlotRepository;
    private final ReservationRepository reservationRepository;

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

    public List<PopupReviewDTO> getReviewByIdAndKeyword(Long id, String keyword) {
        System.out.println("keyword: " + keyword);
        return popupRepository.getReviewByStoreIdAndKeyword(id, keyword).stream()
                .map(PopupReviewDTO::new)
                .toList();
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

//    public List<PopupStoreSlot> getSlotsOfDate(Long popupId, String ymd) {
//        LocalDate date = LocalDate.parse(ymd);
//        return storeSlotRepository.findSlotsOfDate(popupId, date);
//    }

//    @Transactional
//    public PopupReservationDTO reserve(PopupReservationDTO req) {
//        if (req.getPopup() == null || req.getPopup().getStore_id() == null)
//            throw new IllegalArgumentException("popup_id required");
//        if (req.getSlot() == null || req.getSlot().getSlot_id() == null)
//            throw new IllegalArgumentException("slot_id required");
//        if (req.getReservationCount() <= 0 || req.getReservationCount() > 2)
//            throw new IllegalArgumentException("reservationCount must be 1~2");
//
//        PopupStore store = popupRepository.findById(req.getPopup().getStore_id())
//                .orElseThrow(() -> new IllegalArgumentException("popup not found"));
//
//        PopupStoreSlot slot = storeSlotRepository.findById(req.getSlot().getSlot_id())
//                .orElseThrow(() -> new IllegalArgumentException("slot not found"));
//
//        Integer clientVer = req.getSlot().getVersion();
//        if (clientVer != null && !clientVer.equals(slot.getVersion()))
//            throw new OptimisticLockException("version mismatch");
//
//        int willBe = slot.getReserved_count() + req.getReservationCount();
//        if (willBe > slot.getCapacity())
//            throw new IllegalStateException("capacity exceeded");
//
//        slot.setReserved_count(willBe);
//        storeSlotRepository.save(slot); // @Version 으로 자동 증가
//
//        Reservation reservation = Reservation.builder()
//                .store(store)
//                .slot(slot)
//                .reservation_count(req.getReservationCount())
//                .status(1)
//                .deposit_amount(store.getPrice()) // 정책에 맞게
//                .build();
//
//        reservationRepository.save(reservation);
//        return new PopupReservationDTO(reservation);
//    }
//
    public List<SlotDTO> getSlots(Long popupId, LocalDate date) {
        return storeSlotRepository.findSlotsOfDate(popupId, date)
                .stream()
                .map(SlotDTO::new)
                .toList();
    }

    // young 이달의 팝업
    public List<PopupDTO> getPopupsForCurrentMonth() {
        LocalDate now = LocalDate.now();
        // 현재 월의 첫째 날
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        // 현재 월의 마지막 날
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        // 수정된 부분: Repository 메서드에 시작일과 마지막일을 전달합니다.
        List<PopupStore> popups = popupRepository.findPopupsByMonth(startOfMonth, endOfMonth);

        return popups.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Popup 엔티티를 PopupDTO로 변환하는 private 메서드
    private PopupDTO convertToDto(PopupStore popup) {
        PopupDTO dto = new PopupDTO();
        dto.setStore_id(popup.getStore_id());
        dto.setStore_name(popup.getStore_name());
        dto.setCategories(popup.getCategories().stream().map(Category::getCategory_id).collect(Collectors.toList()));
        dto.setCategory_names(popup.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
        dto.setStart_date(popup.getStart_date());
        dto.setEnd_date(popup.getEnd_date());
        return dto;
    }
}
