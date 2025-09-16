package com.example.popic.popup.repository;


import com.example.popic.entity.entities.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;


public interface PopupRepository extends JpaRepository<PopupStore, Long> {

    @Query("SELECT p FROM PopupStore p LEFT JOIN FETCH p.images WHERE p.store_id = :id")
    Optional<PopupStore> findByIdWithImages(Long id);
}
