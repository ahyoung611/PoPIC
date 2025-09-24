package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.reservation_id = :reservationId")
    Optional<Reservation> findById(Long reservationId);

    @Query("SELECT r FROM Reservation r WHERE r.store.store_id = :popupId")
    List<Reservation> getReservationsByPopupId(Long popupId);

    @Query("SELECT r FROM Reservation r WHERE r.user.user_id = :userId")
    List<Reservation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM Reservation r WHERE r.store.store_id = :popupId AND r.status = :sortNum")
    List<Reservation> getReservationsByPopupIdAndSortNum(Long popupId, int sortNum);

    @Modifying
    @Query("UPDATE Reservation r SET r.status = 0 WHERE r.reservation_id = :reservationId ")
    void entryReservationById(Long reservationId);
}
