package com.example.popic.user.repository;


import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

}
