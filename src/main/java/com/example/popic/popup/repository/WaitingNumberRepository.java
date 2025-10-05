package com.example.popic.popup.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.WaitingNumber;
import com.example.popic.popup.dto.WaitingNumberDTO;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WaitingNumberRepository extends JpaRepository<WaitingNumber, Long> {
    boolean existsByStoreAndUserAndWaitingDateAndStatus(PopupStore store, User user, LocalDate date, int status);

    @Query("""
                SELECT COALESCE(MAX(w.queueNumber), 0)
                FROM WaitingNumber w
                WHERE w.store.store_id = :storeId
                  AND w.waitingDate = :date
            """)
    int findMaxQueueNumberByStoreIdAndDate(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    List<WaitingNumber> findByUser(User user);

    @Query("""
                SELECT COUNT(w)
                FROM WaitingNumber w
                WHERE w.store.store_id = :storeId
                  AND w.waitingDate = :date
                  AND w.status = 1
                  AND w.queueNumber < :myQueue
            """)
    long countAheadTeams(
            @Param("storeId") Long storeId,
            @Param("date") LocalDate date,
            @Param("myQueue") Integer myQueue
    );

    // entry
    @Query("""
                SELECT w FROM WaitingNumber w
                WHERE w.store.vendor.vendor_id = :vendorId
                  AND w.waitingDate = CURRENT_DATE
                  AND w.user.name LIKE CONCAT('%', :keyword, '%')
              AND w.status = 0
            """)
    Page<WaitingNumber> findEntryByVendorId(@Param("vendorId") Long vendorId,
                                            @Param("keyword") String keyword,
                                            Pageable pageable);

    // cancel
    @Query("""
                SELECT w FROM WaitingNumber w
                WHERE w.store.vendor.vendor_id = :vendorId
                  AND w.waitingDate = CURRENT_DATE
                  AND w.user.name LIKE CONCAT('%', :keyword, '%')
                  AND w.status = -1
            """)
    Page<WaitingNumber> findCancelByVendorId(@Param("vendorId") Long vendorId,
                                             @Param("keyword") String keyword,
                                             Pageable pageable);

    // 전체
    @Query("""
                SELECT w FROM WaitingNumber w
                WHERE w.store.vendor.vendor_id = :vendorId
                  AND w.waitingDate = CURRENT_DATE
                  AND w.user.name LIKE CONCAT('%', :keyword, '%')
            """)
    Page<WaitingNumber> findByVendorId(@Param("vendorId") Long vendorId,
                                       @Param("keyword") String keyword,
                                       Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE WaitingNumber w SET w.callTime = now() WHERE w.id = :id")
    void waitingCall(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE WaitingNumber w SET w.status = 0 WHERE w.id = :id")
    void waitingEntry(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE WaitingNumber w SET w.status = -1 WHERE w.id = :id")
    void waitingCancel(Long id);

    @Query("""
                SELECT w FROM WaitingNumber w
                WHERE w.store.vendor.vendor_id = :vendorId
                  AND w.waitingDate = CURRENT_DATE
                  AND w.user.name LIKE CONCAT('%', :keyword, '%')
                  AND w.status = 1
            """)
    Page<WaitingNumber> findWaitingByVendorId(Long vendorId, String keyword, Pageable pageable);
}