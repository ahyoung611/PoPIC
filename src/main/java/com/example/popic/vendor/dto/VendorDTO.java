package com.example.popic.vendor.dto;

import com.example.popic.entity.entities.ROLE;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.entity.entities.VendorProfile;
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
public class VendorDTO {
    private Long vendor_id;  // PK
    private String login_id;
    private String password;
    private String vendor_name;
    private String manager_name;
    private String phone_number;
    private VendorProfile profile;  // 프로필 FK
    private String brn;  // 사업자등록번호
    private LocalDateTime join_date;
    private LocalDateTime update_date;
    private LocalDateTime delete_date;
    private ROLE role = ROLE.VENDOR;  // 기본값 VENDOR
    private int status = 2; //2: 승인대기, 1: 정상, 0: 정지, -1: 탈퇴, 3: 가입 반려

    public VendorDTO(Vendor vendor){
        this.vendor_id = vendor.getVendor_id();
        this.login_id = vendor.getLogin_id();
        this.password = vendor.getPassword();
        this.vendor_name = vendor.getVendor_name();
        this.manager_name = vendor.getManager_name();
        this.phone_number = vendor.getPhone_number();
        this.brn = vendor.getBrn();
        this.join_date = vendor.getJoin_date();
    }

}
