package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface PopupStoreScheduleRepository extends JpaRepository<PopupStoreSchedule, Long> {
    Optional<PopupStoreSchedule> findByPopupStoreAndDate(PopupStore store, LocalDate now);
}
