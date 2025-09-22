package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.WaitingNumber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WaitingNumberRepository  extends JpaRepository<WaitingNumber, Long> {
    Optional<WaitingNumber> findByPopupStoreSchedule(PopupStoreSchedule schedule);
}
