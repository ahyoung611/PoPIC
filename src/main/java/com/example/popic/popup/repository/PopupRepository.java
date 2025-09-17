package com.example.popic.popup.repository;


import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface PopupRepository extends JpaRepository<PopupStore, Long> {

    @Query("SELECT p FROM PopupStore p LEFT JOIN FETCH p.images WHERE p.store_id = :id")
    Optional<PopupStore> findByIdWithImages(Long id);

    @Query("SELECT p FROM PopupStoreSchedule p WHERE p.popupStore.store_id = :id")
    List<PopupStoreSchedule> getScheduleByStoreId(Long id);
}
