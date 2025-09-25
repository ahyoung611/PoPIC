package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStoreSlot;
import com.example.popic.entity.entities.Reservation;
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
}
