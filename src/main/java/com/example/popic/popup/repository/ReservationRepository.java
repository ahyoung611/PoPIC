package com.example.popic.popup.repository;

import com.example.popic.entity.entities.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.reservation_id = :reservationId")
    Optional<Reservation> findById(Long reservationId);

    // 서버사이드 페이징 적용
    @Query("""
        SELECT r FROM Reservation r 
        WHERE r.store.vendor.vendor_id = :vendorId 
          AND (:keyword IS NULL OR :keyword = '' OR r.user.name LIKE %:keyword%)
        """)
    Page<Reservation> getReservationsByVendorId(@Param("vendorId") Long vendorId,
                                                @Param("keyword") String keyword,
                                                Pageable pageable);

    @Query("""
        SELECT r FROM Reservation r 
        WHERE r.store.vendor.vendor_id = :vendorId 
          AND r.status = :sortNum 
          AND (:keyword IS NULL OR :keyword = '' OR r.user.name LIKE %:keyword%)
        """)
    Page<Reservation> getReservationsByVendorIdAndSortNum(@Param("vendorId") Long vendorId,
                                                          @Param("sortNum") int sortNum,
                                                          @Param("keyword") String keyword,
                                                          Pageable pageable);

    @Query("SELECT r FROM Reservation r WHERE r.user.user_id = :userId")
    List<Reservation> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Reservation r SET r.status = 0 WHERE r.reservation_id = :reservationId")
    void entryReservationById(Long reservationId);

    // 같은 사람이 같은 시간대 예약할 경우 확인
    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM Reservation r
        WHERE r.user.user_id = :userId
          AND r.store.store_id = :storeId
          AND r.slot.slot_id = :slotId
        """)
    boolean existsDuplicateReservation(@Param("userId") Long userId,
                                       @Param("storeId") Long storeId,
                                       @Param("slotId") Long slotId);


    @Query("""
        SELECT COUNT(r) > 0 
        FROM Reservation r 
        WHERE r.user.user_id = :userId 
          AND r.store.store_id = :popupId 
          AND r.status = 0
    """)
    boolean existsByUserIdAndPopupId(Long userId, Long popupId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM Reservation r " +
            "WHERE r.payment_key = :paymentKey")
    boolean existsByPaymentKey(String paymentKey);
}
