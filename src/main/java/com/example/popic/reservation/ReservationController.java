package com.example.popic.reservation;

import com.example.popic.reservation.ReservationService;
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
    public ResponseEntity<ReservationDTO> confirmAndSave(@RequestBody ReservationDTO dto) {
        // TODO: 토스 결제 confirm API 호출 후 성공 시 저장
        ReservationDTO saved = reservationService.saveReservation(dto);
        return ResponseEntity.ok(saved);
    }

    // 사용자 예약 조회
    @GetMapping("/user/{userId}")
    public List<ReservationDTO> getUserReservations(@PathVariable Long userId) {
        return reservationService.getUserReservations(userId);
    }

    // 운영자 전체 예약 조회
    @GetMapping
    public List<ReservationDTO> getAllReservations() {
        return reservationService.getAllReservations();
    }
}
