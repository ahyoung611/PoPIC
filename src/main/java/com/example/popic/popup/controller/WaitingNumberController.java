package com.example.popic.popup.controller;

import com.example.popic.popup.dto.WaitingNumberDTO;
import com.example.popic.popup.service.WaitingNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/waiting")
@RequiredArgsConstructor
public class WaitingNumberController {
    private final WaitingNumberService waitingNumberService;

    @PostMapping("/create")
    public ResponseEntity<?> createWaiting(@RequestParam Long userId, @RequestParam Long storeId) {
        try {
            WaitingNumberDTO dto = WaitingNumberDTO.fromEntity(waitingNumberService.createWaiting(userId, storeId));
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserWaiting(@PathVariable Long userId) {
        try {
            List<WaitingNumberDTO> waitings = waitingNumberService
                    .findByUserId(userId)
                    .stream()
                    .map(WaitingNumberDTO::fromEntity)
                    .toList();
            return ResponseEntity.ok(waitings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

}
