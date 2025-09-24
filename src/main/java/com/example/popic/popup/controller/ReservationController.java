package com.example.popic.popup.controller;

import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody PopupReservationDTO dto) {
        // 1. 토스 결제 승인 API 호출
        boolean success = true; // 임시

        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "결제 승인 실패"));
        }

        // 2. DB 저장
        PopupReservationDTO saved = reservationService.saveReservation(dto);

        return ResponseEntity.ok(saved);
    }

    // 사용자 예약 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PopupReservationDTO>> getUserReservations(@PathVariable Long userId) {
        List<PopupReservationDTO> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }
}
