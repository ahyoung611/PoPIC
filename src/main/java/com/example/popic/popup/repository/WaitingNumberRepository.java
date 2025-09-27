package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WaitingNumberRepository extends JpaRepository<WaitingNumber, Long> {
    // 스케줄 단위 중복 확인
    boolean existsByStoreAndUserAndScheduleAndStatus(
            PopupStore store, User user, PopupStoreSchedule schedule, int status);

    // 스케줄 단위 최대 순번 조회
    @Query("""
    SELECT COALESCE(MAX(w.queue_number), 0)
    FROM WaitingNumber w
    WHERE w.store.store_id = :storeId
      AND w.schedule.schedule_id = :scheduleId
  """)
    Integer findMaxQueueNumberByStoreIdAndScheduleId(
            @Param("storeId") Long storeId, @Param("scheduleId") Long scheduleId);

    List<WaitingNumber> findByUser(User user);
}
