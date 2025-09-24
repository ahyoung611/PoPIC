package com.example.popic.popup.service;

import com.example.popic.entity.entities.Reservation;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupStoreSlotRepository;
import com.example.popic.popup.repository.ReservationRepository;
import com.example.popic.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PopupRepository storeRepository;
    private final PopupStoreSlotRepository slotRepository;

    public PopupReservationDTO saveReservation(PopupReservationDTO dto) {
        Reservation reservation = new Reservation();
        reservation.setReservation_count(dto.getReservationCount());
        reservation.setStatus(1); // 예약완료
        reservation.setDeposit_amount(dto.getDepositAmount());
        reservation.setPayment_key(dto.getPaymentKey());

        // FK 매핑
        reservation.setUser(userRepository.findById(dto.getUser().getUser_id())
                .orElseThrow(() -> new RuntimeException("User not found")));
        reservation.setStore(storeRepository.findById(dto.getPopup().getStore_id())
                .orElseThrow(() -> new RuntimeException("Store not found")));
        reservation.setSlot(slotRepository.findById(dto.getSlot().getSlot_id())
                .orElseThrow(() -> new RuntimeException("Slot not found")));

        Reservation saved = reservationRepository.save(reservation);
        return PopupReservationDTO.from(saved);
    }

    public PopupReservationDTO findbyId(Long reservationId) {
        return new PopupReservationDTO(reservationRepository.findById(reservationId).orElse(null));
    }

    // 사용자 예약 조회
    public List<PopupReservationDTO> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId)
                .stream()
                .map(PopupReservationDTO::from)
                .toList();
    }

    @Transactional
    public void entryReservationById(Long reservationId) {
        reservationRepository.entryReservationById(reservationId);
    }
}
