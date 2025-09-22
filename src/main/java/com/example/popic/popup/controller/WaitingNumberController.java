package com.example.popic.popup.controller;

import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.service.WaitingNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/waiting")
@RequiredArgsConstructor
public class WaitingNumberController {
    private final WaitingNumberService waitingNumberService;

    // 대기 등록
    @PostMapping("/create")
    public WaitingNumber saveWaiting(
            @RequestParam Long userId,
            @RequestParam Long scheduleId
    ) {
        return waitingNumberService.createWaiting(userId, scheduleId);
    }
}
