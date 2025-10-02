package com.example.popic.user.controller;

import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.dto.UserPasswordDto;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

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

        ResponseCookie cleared = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(false).sameSite("Lax")
                .path("/").maxAge(0).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .build();
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

    // 25.10.02 기존 코드 : 비밀번호 재설정
/*    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long userId, @RequestBody UserPasswordDto req) {
        // 현재 로그인된 사용자의 인증 정보를 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            // 인증되지 않은 사용자 (토큰 없음)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 인증된 사용자의 loginId를 가져오기
        String authenticatedLoginId = authentication.getName();

        // loginId를 사용하여 데이터베이스에서 실제 사용자 ID를 조회
        UserDTO authenticatedUser = service.getUserByLoginId(authenticatedLoginId);

        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 요청 URL의 userId와 현재 로그인된 사용자의 ID를 비교
        Long currentUserId = authenticatedUser.getUser_id();
        if (!currentUserId.equals(userId)) {
            // ID가 일치하지 않으면 권한 없음
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 모든 검증이 통과되면, 비밀번호 변경 서비스를 호출
        accountUserVendorService.changeUserPassword(userId, req);
        return ResponseEntity.noContent().build();
    }*/

    // 25.10.02 신규 코드 : 비밀번호 재설정
    @PostMapping("/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody UserPasswordDto req) {
        // 현재 로그인된 사용자의 인증 정보를 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
        // 인증되지 않은 사용자 (토큰 없음)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "인증이 필요합니다."));
        }

        // 인증된 사용자의 loginId를 가져오기
        String authenticatedLoginId = authentication.getName();

        // loginId를 사용하여 데이터베이스에서 실제 사용자 ID를 조회
        UserDTO authenticatedUser = service.getUserByLoginId(authenticatedLoginId);

        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "권한이 없습니다."));
        }

        // 요청 URL의 userId와 현재 로그인된 사용자의 ID를 비교
        Long currentUserId = authenticatedUser.getUser_id();
        if (!currentUserId.equals(userId)) {
        // ID가 일치하지 않으면 권한 없음
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "본인 계정에서만 변경할 수 있습니다."));
        }
        // 모든 검증이 통과되면, 비밀번호 변경 서비스를 호출
        try {
                    accountUserVendorService.changeUserPassword(userId, req);
                    return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
                    // 예: "비밀번호에 아이디를 포함할 수 없습니다.", "현재 비밀번호가 올바르지 않습니다." 등
                    return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}