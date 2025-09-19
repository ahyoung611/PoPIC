package com.example.popic.admin.controller;

import com.example.popic.admin.service.AdminService;
import com.example.popic.popup.dto.PopupDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private  final AdminService adminService;

    @GetMapping("/popup")
    public ResponseEntity<List<PopupDTO>> findPendingPopup(){
        List<PopupDTO> list = adminService.findPendingPopup();
        return ResponseEntity.ok(list);
    }
}
