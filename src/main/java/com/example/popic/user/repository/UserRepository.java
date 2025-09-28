package com.example.popic.user.repository;


import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    // id 중복여부 boolean 으로 반환
    @Query("select (count(u) > 0) from User u where u.login_id = :loginId")
    boolean existsLoginId(@Param("loginId") String loginId);

    @Query("select (count(u) > 0) from User u where u.email = :email")
    boolean existsEmail(@Param("email") String email);

    // login id 조회
    @Query("select u from User u where u.login_id = :loginId")
    Optional<User> findByLoginId(@Param("loginId") String loginId);

    // user 리스트 & 사용 전환
    @Query("""
        SELECT u FROM User u
        WHERE (:status IS NULL OR u.status = :status)
          AND (
              :keyword IS NULL OR :keyword = '' OR
              u.name LIKE CONCAT('%', :keyword, '%') OR
              u.login_id LIKE CONCAT('%', :keyword, '%') OR
              u.email LIKE CONCAT('%', :keyword, '%')
          )
        ORDER BY u.user_id DESC
    """)
    List<User> search(@Param("status") Integer status, @Param("keyword") String keyword);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.status = :status WHERE u.user_id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") int status);

}
