package com.example.popic.reservation;

import com.example.popic.entity.entities.Reservation;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupStoreSlotRepository;
import com.example.popic.reservation.ReservationDTO;
import com.example.popic.user.repository.UserRepository;
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

    // DTO -> Entity 변환 후 저장
    public ReservationDTO saveReservation(ReservationDTO dto) {
        Reservation reservation = new Reservation();
        reservation.setReservation_count(dto.getReservationCount());
        reservation.setStatus(1); // 예약완료
        reservation.setDeposit_amount(dto.getDepositAmount());
        reservation.setPayment_key(dto.getPaymentKey());

        // FK 매핑
        reservation.setUser(userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found")));
        reservation.setStore(storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new RuntimeException("Store not found")));
        reservation.setSlot(slotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found")));

        Reservation saved = reservationRepository.save(reservation);
        return toDto(saved);
    }

    // 사용자 예약 조회
    public List<ReservationDTO> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // 운영자 전체 예약 조회
    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // Entity -> DTO 변환
    private ReservationDTO toDto(Reservation reservation) {
        return new ReservationDTO(
                reservation.getReservation_id(),
                reservation.getUser().getUser_id(),
                reservation.getStore().getStore_id(),
                reservation.getSlot().getSlot_id(),
                reservation.getReservation_count(),
                reservation.getStatus(),
                reservation.getDeposit_amount(),
                reservation.getPayment_key(),
                reservation.getCreated_at(),
                reservation.getCanceledAt()
        );
    }
}
