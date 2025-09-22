package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WaitingNumberRepository  extends JpaRepository<WaitingNumber, Long> {
    @Query("SELECT MAX(w.queue_number) FROM WaitingNumber w WHERE w.store = :store")
    Optional<Integer> findMaxQueueNumberByStore(@Param("store") PopupStore store);

    boolean existsByStoreAndUserAndStatus(PopupStore store, User user, int status);
}
