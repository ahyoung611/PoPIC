package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.repository.PopupStoreScheduleRepository;
import com.example.popic.popup.repository.WaitingNumberRepository;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WaitingNumberService {

    private final WaitingNumberRepository waitingNumberRepository;
    private final UserRepository userRepository;
    private final PopupStoreScheduleRepository scheduleRepository;

    public WaitingNumber createWaiting(Long userId, Long scheduleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        PopupStoreSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // 현재 스케줄의 마지막 대기번호 찾기
        int lastQueue = waitingNumberRepository
                .findByPopupStoreSchedule(schedule)
                .map(WaitingNumber::getQueue_number)
                .orElse(0);

        WaitingNumber waitingNumber = new WaitingNumber();
        waitingNumber.setUser(user);
        waitingNumber.setPopupStoreSchedule(schedule);
        waitingNumber.setQueue_number(lastQueue + 1);
        waitingNumber.setStatus(1);

        return waitingNumberRepository.save(waitingNumber);
    }
}
