package com.example.popic.user.dto;

import com.example.popic.entity.entities.ROLE;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.UserProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long user_id;  // PK
    private String login_id;
    private String email;
    private String password;
    private String name;
    private String phone_number;
    private Integer point = 0;
    private Long user_profile;  // 프로필 FK
    private LocalDateTime join_date;
    private LocalDateTime update_date;
    private LocalDateTime delete_date;
    private ROLE role = ROLE.USER;  // USER, VENDOR, ADMIN
    private int status = 1; // 1: 정상, 0: 정지, -1: 탈퇴

    public UserDTO(User user) {
        this.email = user.getEmail();
        this.join_date = user.getJoin_date();
        this.login_id = user.getLogin_id();
        this.name = user.getName();
        this.point = user.getPoint();
        this.phone_number = user.getPhone_number();
        this.user_id = user.getUser_id();
    }

}
