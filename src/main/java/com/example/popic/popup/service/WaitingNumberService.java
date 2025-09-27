package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.PopupStoreScheduleRepository;
import com.example.popic.popup.repository.WaitingNumberRepository;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitingNumberService {

    private final WaitingNumberRepository waitingNumberRepository;
    private final UserRepository userRepository;
    private final PopupRepository popupRepository;
    private final PopupStoreScheduleRepository scheduleRepository;

    public WaitingNumber createWaiting(Long userId, Long storeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        PopupStore store = popupRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        PopupStoreSchedule todaySchedule = scheduleRepository.findByPopupStoreAndDate(store, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("오늘은 운영 스케줄이 없습니다."));

        LocalTime now = LocalTime.now();
        if (now.isBefore(todaySchedule.getStart_time()) || now.isAfter(todaySchedule.getEnd_time())) {
            throw new RuntimeException("현재는 운영 시간이 아닙니다.");
        }

        if (waitingNumberRepository.existsByStoreAndUserAndStatus(store, user, 1)) {
            throw new RuntimeException("이미 대기 중입니다.");
        }

        Integer lastQueue = waitingNumberRepository.findMaxQueueNumberByStoreId(store.getStore_id()).orElse(0);

        WaitingNumber waitingNumber = new WaitingNumber();
        waitingNumber.setUser(user);
        waitingNumber.setStore(store);
        waitingNumber.setQueue_number(lastQueue + 1);
        waitingNumber.setStatus(1);

        return waitingNumberRepository.save(waitingNumber);
    }

    public List<WaitingNumber> findByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return waitingNumberRepository.findByUser(user);
    }

}
