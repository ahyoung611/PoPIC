package com.example.popic.popup.controller;

import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.repository.ReservationRepository;
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
    private final ReservationRepository reservationRepository;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody PopupReservationDTO dto) {
        try {
            PopupReservationDTO saved = reservationService.saveReservation(dto);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<?> checkDuplicate(@RequestParam Long userId,
                                            @RequestParam Long storeId,
                                            @RequestParam Long slotId) {
        boolean exists = reservationRepository.existsDuplicateReservation(userId, storeId, slotId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 사용자 예약 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PopupReservationDTO>> getUserReservations(@PathVariable Long userId) {
        List<PopupReservationDTO> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }
}
