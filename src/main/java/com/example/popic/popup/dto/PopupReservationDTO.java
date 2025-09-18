package com.example.popic.popup.dto;

import com.example.popic.entity.entities.Reservation;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopupReservationDTO {
    private Long reservationId;        // 예약번호 (PK)
    private Long userId;               // 사용자 ID
    private Long storeId;              // 팝업스토어 ID
    private Long slotId;               // 슬롯 ID

    private int reservationCount;      // 예약자 수(최대 2명)
    private LocalDateTime createdAt;   // 예약 생성 시각
    private int status;                // 1: 예약, -1: 취소, 0: 참여완료
    private BigDecimal depositAmount;  // 예약금
    private String paymentKey;         // PG사 키
    private LocalDateTime canceledAt;  // 취소 시각

    public static PopupReservationDTO from(Reservation e) {
        return PopupReservationDTO.builder()
                .reservationId(e.getReservation_id())
                .userId(e.getUser() != null ? e.getUser().getUser_id() : null)
                .storeId(e.getStore() != null ? e.getStore().getStore_id() : null)
                .slotId(e.getSlot() != null ? e.getSlot().getSlot_id() : null)
                .reservationCount(e.getReservation_count())
                .createdAt(e.getCreated_at())
                .status(e.getStatus())
                .depositAmount(e.getDeposit_amount())
                .paymentKey(e.getPayment_key())
                .canceledAt(e.getCanceledAt())
                .build();
    }
}
