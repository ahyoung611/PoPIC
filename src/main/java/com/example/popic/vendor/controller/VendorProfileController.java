package com.example.popic.vendor.controller;

import com.example.popic.entity.entities.VendorProfile;
import com.example.popic.user.dto.UserPasswordDto;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.dto.VendorPasswordDto;
import com.example.popic.vendor.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.nio.file.Files;
import java.nio.file.Path;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vendors/{vendorId}")
public class VendorProfileController {

    private final VendorProfileService service;
    private final AccountUserVendorService accountUserVendorService;
    
    // 벤더 프로필 조회
    @GetMapping
    public VendorDTO get(@PathVariable Long vendorId) {
        System.out.println("vendorId: ");
        VendorDTO dto = service.getProfile(vendorId);
        
        VendorProfile profile = service.getProfileByVendorId(vendorId);
        dto.setAvatarExists(profile != null && profile.getSaved_name() != null);

        return dto;
    }

    // 벤더 승인 재요청
    @PostMapping("/status/reapply")
    public ResponseEntity<VendorDTO> reapply(@PathVariable Long vendorId) {
        VendorDTO dto = service.requestReapproval(vendorId);
        return ResponseEntity.ok(dto);
    }

    // 벤더 프로필 수정
    @PutMapping
    public VendorDTO update(@PathVariable Long vendorId, @RequestBody Map<String, Object> payload) {
        VendorDTO dto = new VendorDTO();
        dto.setVendor_name((String) payload.get("vendor_name"));
        dto.setManager_name((String) payload.get("manager_name"));
        dto.setPhone_number((String) payload.get("phone_number"));
        dto.setBrn((String) payload.get("brn"));
        dto.setPassword((String) payload.get("password"));

        return service.updateProfile(vendorId, dto);
    }

    @GetMapping("/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long vendorId) {
        VendorProfile profile = service.getProfileByVendorId(vendorId);
        if (profile == null || profile.getSaved_name() == null) {
            return ResponseEntity.notFound().build();
        }

        String savedName = profile.getSaved_name();
        String os = System.getProperty("os.name").toLowerCase();
        String home = System.getProperty("user.home");
        Path imagePath = os.contains("win")
                ? Path.of("C:/vendorProfile/", savedName)
                : Path.of(home, "vendorProfile", savedName);

        try {
            byte[] imageBytes = Files.readAllBytes(imagePath);
            String contentType = Files.probeContentType(imagePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/photo-url")
    public ResponseEntity<Map<String, String>> getPhotoUrl(@PathVariable Long vendorId) {
        String url = service.getProfilePhotoUrl(vendorId); // 아래에서 구현
        if (url != null) {
            return ResponseEntity.ok(Map.of("url", url));
        }
        return ResponseEntity.notFound().build();
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

    // 비밀번호 재설정
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long vendorId, @RequestBody VendorPasswordDto req) {
        accountUserVendorService.changeVendorPassword(vendorId, req);
        return ResponseEntity.noContent().build();
    }
}
