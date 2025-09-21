package com.example.popic.user.controller;

import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}")
public class UserProfileController {

    private final UserProfileService service;

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

    // 프로필 사진 URL 조회
    @GetMapping("/photo")
    public String getPhoto(@PathVariable Long userId) {
        return service.getProfilePhotoUrl(userId);
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
}
