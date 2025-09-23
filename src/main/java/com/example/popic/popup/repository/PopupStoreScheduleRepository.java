package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PopupStoreScheduleRepository extends JpaRepository<PopupStoreSchedule, Long> {
    Optional<PopupStoreSchedule> findByPopupStoreAndDate(PopupStore store, LocalDate now);

    @Query("""
           select s
           from PopupStoreSchedule s
           where s.popupStore.store_id = :popupId 
             and s.date between :start and :end
           """)
    List<PopupStoreSchedule> findByPopupStoreIdAndDateBetween(
            @Param("popupId") Long popupId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}
