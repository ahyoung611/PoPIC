package com.example.popic.user.repository;


import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, Long> {
//    boolean existsByLogin_id(String login_id);

}
