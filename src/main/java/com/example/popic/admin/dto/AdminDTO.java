package com.example.popic.admin.dto;

import com.example.popic.entity.entities.Admin;
import com.example.popic.entity.entities.ROLE;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDTO {
    private Long admin_id;
    private String login_id;
    private String password;
    private ROLE role = ROLE.ADMIN;

    public AdminDTO(Admin admin){
        this.admin_id = admin.getAdmin_id();
        this.login_id = admin.getLogin_id();
        this.password = admin.getPassword();
        this.role = admin.getRole();
    }
}
