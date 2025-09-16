package com.example.popic.vendor.controller;

import com.example.popic.entity.entities.Vendor;
import com.example.popic.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendor")
@RequiredArgsConstructor
public class VendorController {
    private final VendorService vendorService;

    @GetMapping({"/popups", "/popups/**"})
    public String vendorPopups() {
        return "forward:/index.html";
    }

    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestBody Vendor req) {
        Long id = vendorService.joinVendor(req); // 내부에서 비번해시/중복검사
        return ResponseEntity.ok(new ApiRes("OK", id));
    }

    public record ApiRes(String status, Long id) {}

}
