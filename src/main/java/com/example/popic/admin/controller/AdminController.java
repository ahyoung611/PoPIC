package com.example.popic.admin.controller;

import com.example.popic.admin.service.AdminService;
import com.example.popic.popup.dto.PopupDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private  final AdminService adminService;

    @GetMapping("/popup")
    public ResponseEntity<List<PopupDTO>> getPopupStatus(@RequestParam(name="sort", defaultValue = "")String sort,
                                                         @RequestParam(name="keyword", defaultValue = "")String keyword){
        List<PopupDTO> list = adminService.getPopupStatus(sort, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/popupConfirm")
    public void popupConfirm(@RequestParam(name="popupId")Long popupId,
                             @RequestParam(name = "statusCode")int statusCode){
        adminService.updatePopupStatus(popupId,statusCode);
    }
}
