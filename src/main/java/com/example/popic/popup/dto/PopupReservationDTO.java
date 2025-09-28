package com.example.popic.popup.dto;

import com.example.popic.entity.entities.Reservation;
import com.example.popic.user.dto.UserDTO;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopupReservationDTO {
    private Long reservationId;         // 예약번호 (PK)
    private UserDTO user;               // 사용자 ID
    private PopupDTO popup;             // 팝업스토어 ID
    private SlotDTO slot;               // 슬롯 ID

    private int reservationCount;       // 예약자 수(최대 2명)
    private LocalDateTime createdAt;    // 예약 생성 시각
    private int status;                 // 1: 예약, -1: 취소, 0: 참여완료
    private BigDecimal depositAmount;   // 예약금
    private String paymentKey;          // PG사 키
    private LocalDateTime canceledAt;   // 취소 시각

    public PopupReservationDTO(Reservation reservation) {
        this.reservationId = reservation.getReservation_id();
        this.user = new UserDTO(reservation.getUser());
        this.popup = new PopupDTO(reservation.getStore());
        this.slot = new SlotDTO(reservation.getSlot());
        this.reservationCount = reservation.getReservation_count();
        this.createdAt = reservation.getCreated_at();
        this.status = reservation.getStatus();
        this.depositAmount = reservation.getDeposit_amount();
        this.paymentKey = reservation.getPayment_key();
        this.canceledAt = reservation.getCanceledAt();
    }

    public static PopupReservationDTO from(Reservation e) {
        return PopupReservationDTO.builder()
                .reservationId(e.getReservation_id())
                .user(e.getUser() != null ? new UserDTO(e.getUser()): null)
                .popup(e.getStore() != null ?  new PopupDTO(e.getStore()): null)
                .slot(e.getSlot() != null ? new SlotDTO(e.getSlot()) : null)
                .reservationCount(e.getReservation_count())
                .createdAt(e.getCreated_at())
                .status(e.getStatus())
                .depositAmount(e.getDeposit_amount())
                .paymentKey(e.getPayment_key())
                .canceledAt(e.getCanceledAt())
                .build();
    }
}
