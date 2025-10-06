package com.example.popic.popup.service;

import com.example.popic.CustomUserPrincipal;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSlot;
import com.example.popic.entity.entities.Reservation;
import com.example.popic.entity.entities.User;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupStoreSlotRepository;
import com.example.popic.popup.repository.ReservationRepository;
import com.example.popic.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PopupRepository storeRepository;
    private final PopupStoreSlotRepository slotRepository;

    @Transactional
    public PopupReservationDTO reserveSlot(Long slotId, Long userId, Long storeId,
                                           int count, BigDecimal depositAmount, String paymentKey) {

        if(paymentKey != null && reservationRepository.existsByPaymentKey(paymentKey)){
            throw new IllegalStateException("이미 처리된 결제입니다.");
        }

        PopupStoreSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));


        if (slot.getReserved_count() + count > slot.getCapacity()) {
            throw new IllegalStateException("해당 슬롯 정원이 가득 찼습니다.");
        }

        slot.setReserved_count(slot.getReserved_count() + count);
        slotRepository.save(slot);

        Reservation reservation = Reservation.builder()
                .user(userRepository.findById(userId).orElseThrow())
                .store(storeRepository.findById(storeId).orElseThrow())
                .slot(slot)
                .reservation_count(count)
                .status(1)
                .deposit_amount(depositAmount != null ? depositAmount : BigDecimal.ZERO)
                .payment_key(paymentKey)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return PopupReservationDTO.from(saved);
    }

    // 사용자 예약 조회
    public List<PopupReservationDTO> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId)
                .stream()
                .map(PopupReservationDTO::from)
                .toList();
    }

    // 슬롯 잔여 조회
    @Transactional
    public Map<String, Object> getSlotRemaining(Long slotId) {
        PopupStoreSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        int remaining = slot.getCapacity() - slot.getReserved_count();
        return Map.of(
                "slotId", slotId,
                "capacity", slot.getCapacity(),
                "reserved", slot.getReserved_count(),
                "remaining", remaining
        );
    }

    public PopupReservationDTO findbyId(Long reservationId) {
        return new PopupReservationDTO(reservationRepository.findById(reservationId).orElse(null));
    }


    @Transactional
    public void entryReservationById(Long reservationId) {
        reservationRepository.entryReservationById(reservationId);
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));

        // 본인 예약인지 확인
        if (!reservation.getUser().getUser_id().equals(userId)) {
            throw new IllegalStateException("본인의 예약만 취소할 수 있습니다.");
        }

        // 이미 취소된 경우
        if (reservation.getStatus() == -1) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        // 상태 변경
        reservation.setStatus(-1);
        reservationRepository.save(reservation);
    }

    public boolean isJoin(Long popupId, CustomUserPrincipal principal) {
        return reservationRepository.existsByUserIdAndPopupId(principal.getId(), popupId);
    }

    @Transactional
    public PopupReservationDTO reserveFreeSlot(Long slotId, Long userId, Long storeId, int count) {
        if (reservationRepository.existsDuplicateReservation(userId, storeId, slotId)) {
            throw new IllegalStateException("이미 해당 슬롯에 예약이 있습니다.");
        }

        User userRef = userRepository.getReferenceById(userId);
        PopupStore storeRef = storeRepository.getReferenceById(storeId);
        PopupStoreSlot slotRef = slotRepository.getReferenceById(slotId);

        if (slotRef.getReserved_count() + count > slotRef.getCapacity()) {
            throw new IllegalStateException("해당 슬롯 정원이 가득 찼습니다.");
        }

        slotRef.setReserved_count(slotRef.getReserved_count() + count);
        slotRepository.save(slotRef);

        Reservation r = new Reservation();
        r.setUser(userRef);
        r.setStore(storeRef);
        r.setSlot(slotRef);
        r.setReservation_count(count);
        r.setDeposit_amount(BigDecimal.ZERO);
        r.setPayment_key("FREE");
        r.setStatus(1);

        Reservation saved = reservationRepository.save(r);
        return PopupReservationDTO.from(saved);
    }
}
