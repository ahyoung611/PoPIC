package com.example.popic.popup;

import com.example.popic.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class PopupStoreScheduler {
    private final PopupService popupService;


    // 매일 00:00에 실행
    @Scheduled(cron = "0 0 0 * * ?")
    public void updateEndedPopupStores() {
        System.out.println("스케줄러 실행");
        LocalDate today = LocalDate.now();

        // end_date가 오늘보다 이전이고 status가 1인 팝업스토어 조회
        popupService.updateEndedStores(today, 1);

    }

}
