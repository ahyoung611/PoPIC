package com.example.popic.reservation;

import com.example.popic.entity.entities.Reservation;
import com.example.popic.entity.entities.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.user.user_id = :userId")
    List<Reservation> findByUserId(@Param("userId") Long userId);

}

