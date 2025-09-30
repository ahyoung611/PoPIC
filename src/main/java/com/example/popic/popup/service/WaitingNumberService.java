package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.dto.WaitingNumberDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.repository.WaitingNumberRepository;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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

    public Page<WaitingNumberDTO> findByVendorId(Long vendorId, String sort, String keyword, Pageable pageable) {
        Page<WaitingNumber> pageResult;

        switch (sort.toLowerCase()) {
            case "entry":
                pageResult = waitingNumberRepository.findEntryByVendorId(vendorId, keyword, pageable);
                break;
            case "cancel":
                pageResult = waitingNumberRepository.findCancelByVendorId(vendorId, keyword, pageable);
                break;
            default:
                pageResult = waitingNumberRepository.findByVendorId(vendorId, keyword, pageable);
                break;
        }

        return pageResult.map(WaitingNumberDTO::new);
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
