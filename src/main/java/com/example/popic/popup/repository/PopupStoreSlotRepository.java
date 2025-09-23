package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStoreSlot;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PopupStoreSlotRepository extends JpaRepository<PopupStoreSlot, Long> {
    @Query("""
           select sl
           from PopupStoreSlot sl
           where sl.schedule.popupStore.store_id = :popupId 
             and sl.schedule.date = :date
           """)
    List<PopupStoreSlot> findSlotsOfDate(
            @Param("popupId") Long popupId,
            @Param("date") LocalDate date
    );
}
