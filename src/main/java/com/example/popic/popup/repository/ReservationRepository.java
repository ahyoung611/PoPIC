package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Reservation;
import com.example.popic.popup.dto.PopupReservationDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.store.store_id = :popupId")
    List<Reservation> getReservationsByPopupId(Long popupId);

}
