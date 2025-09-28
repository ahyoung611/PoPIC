package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.dto.WaitingNumberDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.WaitingNumberRepository;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WaitingNumberService {
    private final WaitingNumberRepository waitingNumberRepository;
    private final UserRepository userRepository;
    private final PopupRepository popupRepository;

    public WaitingNumber createWaiting(Long userId, Long storeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        PopupStore store = popupRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        LocalDate today = LocalDate.now();

        if (waitingNumberRepository.existsByStoreAndUserAndWaitingDateAndStatus(store, user, today, 1)) {
            throw new RuntimeException("이미 대기 중입니다.");
        }

        int lastQueue = waitingNumberRepository.findMaxQueueNumberByStoreIdAndDate(store.getStore_id(), today);
        int nextQueue = lastQueue + 1;

        WaitingNumber w = new WaitingNumber();
        w.setUser(user);
        w.setStore(store);
        w.setQueueNumber(nextQueue);
        w.setStatus(1);
        w.setWaitingDate(today);

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
        w.setStatus(newStatus); // -1: 취소
        return waitingNumberRepository.save(w);
    }

    public long countAheadTeams(Long waitingId) {
        var w = waitingNumberRepository.findById(waitingId)
                .orElseThrow(() -> new RuntimeException("Waiting not found"));
        return waitingNumberRepository.countAheadTeams(
                w.getStore().getStore_id(),
                w.getWaitingDate(),
                w.getQueueNumber()
        );
    }

    public List<WaitingNumberDTO> findByVendorId(Long vendorId, String sort, String keyword) {
        switch (sort) {
            case "entry":
                return waitingNumberRepository.findEntryByVendorId(vendorId, keyword).stream()
                        .map(WaitingNumberDTO::new)
                        .collect(Collectors.toList());
            case "cancel":
                return waitingNumberRepository.findCancelByVendorId(vendorId, keyword).stream().map(WaitingNumberDTO::new)
                        .collect(Collectors.toList());
            default:
                return waitingNumberRepository.findByVendorId(vendorId,keyword).stream()
                        .map(WaitingNumberDTO::new)
                        .collect(Collectors.toList());
        }
    }

    public void waitingCall(Long id) {
        waitingNumberRepository.waitingCall(id);
    }

    public void waitingEntry(Long id) {
        waitingNumberRepository.waitingEntry(id);
    }

    public void waitingCancel(Long id) {
        waitingNumberRepository.waitingCancel(id);
    }
}
