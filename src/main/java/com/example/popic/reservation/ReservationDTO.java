package com.example.popic.reservation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private Long reservationId;
    private Long userId;
    private Long storeId;
    private Long slotId;

    private int reservationCount;
    private int status;
    private BigDecimal depositAmount;
    private String paymentKey;

    private LocalDateTime createdAt;
    private LocalDateTime canceledAt;
}
