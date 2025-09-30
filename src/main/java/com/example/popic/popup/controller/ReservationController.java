package com.example.popic.popup.controller;

import com.example.popic.CustomUserPrincipal;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.repository.ReservationRepository;
import com.example.popic.popup.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final StringRedisTemplate stringRedisTemplate;
    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody PopupReservationDTO dto) {
        try {
            PopupReservationDTO saved = reservationService.reserveSlot(
                    dto.getSlot().getSlot_id(),
                    dto.getUser().getUser_id(),
                    dto.getPopup().getStore_id(),
                    dto.getReservationCount(),
                    dto.getDepositAmount(),
                    dto.getPaymentKey()
            );
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
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

    // 슬롯 잔여 조회
    @GetMapping("/slot/{slotId}/remaining")
    public ResponseEntity<?> getSlotRemaining(@PathVariable Long slotId) {
        return ResponseEntity.ok(reservationService.getSlotRemaining(slotId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PopupReservationDTO>> getMyReservations(@RequestParam Long userId) {
        List<PopupReservationDTO> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }

    @PatchMapping("/{reservationId}/cancel")
    public ResponseEntity<?> cancelReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        try {
            Long userId = principal.getId(); // 내부 user 엔티티 접근
            reservationService.cancelReservation(reservationId, userId);


            return ResponseEntity.ok(Map.of("message", "예약이 취소되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/isJoin")
    public ResponseEntity<Boolean> isJoin (@RequestParam Long popupId,
                                           @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isJoin = reservationService.isJoin(popupId,principal);
        return ResponseEntity.ok(isJoin);
    }

    @PostMapping("/free")
    public ResponseEntity<?> reserveFree(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        try {
            Long userId  = principal.getId();
            Long slotId  = ((Number) body.get("slotId")).longValue();
            Long storeId = ((Number) body.get("storeId")).longValue();
            Integer count = ((Number) body.get("reservationCount")).intValue();

            PopupReservationDTO saved = reservationService.reserveFreeSlot(slotId, userId, storeId, count);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "잘못된 요청입니다."));
        }
    }
}
