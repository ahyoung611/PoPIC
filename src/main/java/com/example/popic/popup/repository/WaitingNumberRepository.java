package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WaitingNumberRepository extends JpaRepository<WaitingNumber, Long> {
    boolean existsByStoreAndUserAndWaitingDateAndStatus(PopupStore store, User user, LocalDate date, int status);

    @Query("""
        SELECT COALESCE(MAX(w.queueNumber), 0)
        FROM WaitingNumber w
        WHERE w.store.store_id = :storeId
          AND w.waitingDate = :date
    """)
    int findMaxQueueNumberByStoreIdAndDate(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    List<WaitingNumber> findByUser(User user);

    @Query("""
        SELECT COUNT(w)
        FROM WaitingNumber w
        WHERE w.store.store_id = :storeId
          AND w.waitingDate = :date
          AND w.status = 1
          AND w.queueNumber < :myQueue
    """)
    long countAheadTeams(
            @Param("storeId") Long storeId,
            @Param("date") LocalDate date,
            @Param("myQueue") Integer myQueue
    );
}