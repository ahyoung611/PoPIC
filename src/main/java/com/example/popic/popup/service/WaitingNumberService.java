package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
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

        // 오늘자 스케줄(운영중) 선택
        var todaySchedule = scheduleRepository.findByPopupStoreAndDate(store, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("오늘은 운영 스케줄이 없습니다."));

        var now = LocalTime.now();
        if (now.isBefore(todaySchedule.getStart_time()) || now.isAfter(todaySchedule.getEnd_time())) {
            throw new RuntimeException("현재는 운영 시간이 아닙니다.");
        }

        // 스케줄 단위 중복 체크
        if (waitingNumberRepository.existsByStoreAndUserAndScheduleAndStatus(store, user, todaySchedule, 1)) {
            throw new RuntimeException("이미 대기 중입니다.");
        }

        // 스케줄 단위로 다음 번호
        int lastQueue = waitingNumberRepository
                .findMaxQueueNumberByStoreIdAndScheduleId(store.getStore_id(), todaySchedule.getSchedule_id());
        int nextQueue = lastQueue + 1;

        WaitingNumber w = new WaitingNumber();
        w.setUser(user);
        w.setStore(store);
        w.setSchedule(todaySchedule);
        w.setQueue_number(nextQueue);
        w.setStatus(1);

        return waitingNumberRepository.save(w);
    }

    public List<WaitingNumber> findByUserId(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return waitingNumberRepository.findByUser(user);
    }

    public WaitingNumber updateStatus(Long waitingId, int newStatus) {
        var w = waitingNumberRepository.findById(waitingId)
                .orElseThrow(() -> new RuntimeException("Waiting not found"));
        w.setStatus(newStatus);        // 사용자 요청: 취소 시 -1 사용
        return waitingNumberRepository.save(w);
    }

    public long countAheadTeams(Long waitingId) {
        var w = waitingNumberRepository.findById(waitingId)
                .orElseThrow(() -> new RuntimeException("Waiting not found"));
        return waitingNumberRepository.countAheadTeams(
                w.getStore().getStore_id(),
                w.getSchedule().getSchedule_id(),
                w.getQueue_number()
        );
    }
}
