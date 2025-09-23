package com.example.popic.user.controller;

import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.dto.UserPasswordDto;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}")
public class UserProfileController {

    private final UserProfileService service;
    private final AccountUserVendorService accountUserVendorService;

    // 프로필 조회
    @GetMapping
    public UserDTO get(@PathVariable Long userId) {
        return service.getProfile(userId);
    }

    // 프로필 수정
    @PutMapping
    public UserDTO update(@PathVariable Long userId, @RequestBody UserDTO dto) {
        return service.updateProfile(userId, dto);
    }

    // 프로필 삭제 (회원 탈퇴)
    @DeleteMapping
    public ResponseEntity<Void> delete(@PathVariable Long userId) {
        service.deleteProfile(userId);
        return ResponseEntity.ok().build();
    }

    // 프로필 사진 조회 (이미지 파일을 직접 반환)
    @GetMapping("/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long userId) {
        // 서비스에서 파일 경로를 받습니다.
        Path imagePath = service.getProfilePhotoPath(userId);
        if (imagePath == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] imageBytes = Files.readAllBytes(imagePath);
            String contentType = Files.probeContentType(imagePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 프로필 사진 업로드/교체
    @PostMapping("/photo")
    public UserDTO uploadPhoto(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        return service.uploadProfilePhoto(userId, file);
    }

    // 프로필 사진 삭제
    @DeleteMapping("/photo")
    public UserDTO deletePhoto(@PathVariable Long userId) {
        return service.deleteProfilePhoto(userId);
    }

    // 즐겨찾기 목록 조회
    @GetMapping("/favorites")
    public List<?> getFavorites(@PathVariable Long userId) {
        return List.of();
    }

    // 비밀번호 재설정
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long userId, @RequestBody UserPasswordDto req) {
        accountUserVendorService.changeUserPassword(userId, req);
        return ResponseEntity.noContent().build();
    }




}
