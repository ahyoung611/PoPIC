package com.example.popic.vendor.controller;

import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vendors/{vendorId}")
public class VendorProfileController {

    private final VendorProfileService service;
    
    // 벤더 프로필 조회
    @GetMapping
    public VendorDTO get(@PathVariable Long vendorId) {
        return service.getProfile(vendorId);
    }

    // 벤더 프로필 수정
    @PutMapping
    public VendorDTO update(@PathVariable Long vendorId, @RequestBody VendorDTO dto) {
        return service.updateProfile(vendorId, dto);
    }

    // 벤더 프로필 사진 조회
    @GetMapping("/photo")
    public Map<String, String> getPhoto(@PathVariable Long vendorId) {
        String url = service.getProfilePhotoUrl(vendorId); // 사진 없으면 null
        return Map.of("url", url != null ? url : "");
    }

    // 벤더 프로필 사진 업로드/교체
    @PostMapping("/photo")
    public VendorDTO uploadPhoto(@PathVariable Long vendorId, @RequestParam("file") MultipartFile file) {
        return service.uploadProfilePhoto(vendorId, file);
    }

    // 벤더 프로필 사진 삭제
    @DeleteMapping("/photo")
    public VendorDTO deletePhoto(@PathVariable Long vendorId) {
        return service.deleteProfilePhoto(vendorId);
    }
}
