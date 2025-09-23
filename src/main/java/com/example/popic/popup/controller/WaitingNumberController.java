package com.example.popic.popup.controller;

import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.service.WaitingNumberService;
import lombok.RequiredArgsConstructor;
import com.example.popic.popup.dto.WaitingNumberDTO;
import com.example.popic.popup.service.WaitingNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/waiting")
@RequiredArgsConstructor
public class WaitingNumberController {
    private final WaitingNumberService waitingNumberService;

    @PostMapping("/create")
    public ResponseEntity<WaitingNumberDTO> createWaiting(
            @RequestParam Long userId,
            @RequestParam Long storeId) {
        WaitingNumber waitingNumber = waitingNumberService.createWaiting(userId, storeId);
        return ResponseEntity.ok(WaitingNumberDTO.fromEntity(waitingNumber));
    }
}
