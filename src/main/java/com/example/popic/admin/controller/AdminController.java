package com.example.popic.admin.controller;

import com.example.popic.admin.service.AdminService;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.vendor.dto.VendorDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private  final AdminService adminService;

    @GetMapping("/popup")
    public ResponseEntity<List<PopupDTO>> getPopupStatus(@RequestParam(name="sort", defaultValue = "")String sort,
                                                         @RequestParam(name="keyword", defaultValue = "")String keyword){
        System.out.println("adminPopup 진입");
        List<PopupDTO> list = adminService.getPopupStatus(sort, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/popupConfirm")
    public void popupConfirm(@RequestParam(name="popupId")Long popupId,
                             @RequestParam(name = "statusCode")int statusCode){
        adminService.updatePopupStatus(popupId,statusCode);
    }

    // ----- Users -----
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> listUsers(
            @RequestParam(defaultValue = "") String sort,
            @RequestParam(defaultValue = "") String keyword
    ) {
        return ResponseEntity.ok(adminService.findUsers(sort, keyword));
    }

    @PostMapping("/user/status")
    public ResponseEntity<Void> changeUserStatus(
            @RequestParam Long id,
            @RequestParam int status
    ) {
        adminService.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // ----- Vendors -----
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorDTO>> listVendors(
            @RequestParam(defaultValue = "") String sort,
            @RequestParam(defaultValue = "") String keyword
    ) {
        return ResponseEntity.ok(adminService.findVendors(sort, keyword));
    }

    @PostMapping("/vendor/status")
    public ResponseEntity<Void> changeVendorStatus(
            @RequestParam Long id,
            @RequestParam int status
    ) {
        adminService.updateVendorStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
