package com.example.popic.popup.controller;

import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // 결제 확인 + 예약 저장
    @PostMapping("/confirm")
    public ResponseEntity<PopupReservationDTO> confirmAndSave(@RequestBody PopupReservationDTO dto) {
        // 토스 결제 confirm API 호출 후 성공 시 저장
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
