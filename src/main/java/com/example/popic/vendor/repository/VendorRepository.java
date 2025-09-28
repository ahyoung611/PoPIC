package com.example.popic.vendor.repository;

import com.example.popic.entity.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface VendorRepository extends JpaRepository<Vendor, Long>  {
    @Query("select (count(v) > 0) from Vendor v where v.login_id = :loginId")
    boolean existsLoginId(@Param("loginId") String loginId);

    @Query("select (count(v) > 0) from Vendor v where v.brn = :brn")
    boolean existsBrn(@Param("brn") String brn);
  
    // JPQL로 login_id 매핑
    @Query("select v from Vendor v where v.login_id = :loginId")
    Optional<Vendor> findByLoginId(@Param("loginId") String loginId);

    // vendor 리스트 & 사용 전환
    @Query("""
        SELECT v FROM Vendor v
        WHERE (:status IS NULL OR v.status = :status)
          AND (
              :keyword IS NULL OR :keyword = '' OR
              v.vendor_name LIKE CONCAT('%', :keyword, '%') OR
              v.manager_name LIKE CONCAT('%', :keyword, '%') OR
              v.login_id LIKE CONCAT('%', :keyword, '%') OR
              v.brn LIKE CONCAT('%', :keyword, '%')
          )
        ORDER BY v.vendor_id DESC
    """)
    List<Vendor> search(@Param("status") Integer status, @Param("keyword") String keyword);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Vendor v SET v.status = :status WHERE v.vendor_id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") int status);
}
