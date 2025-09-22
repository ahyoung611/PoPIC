package com.example.popic.auth.controller;

import com.example.popic.auth.dto.LoginResponse;
import com.example.popic.auth.dto.NaverUserInfo;
import com.example.popic.auth.service.AuthService;
import com.example.popic.auth.service.NaverLoginService;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// 리프레시 토큰용
import com.example.popic.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final NaverLoginService naverLoginService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    @GetMapping("/naver/callback")
    public ResponseEntity<?> callback(@RequestParam String code, @RequestParam String state, HttpServletResponse response) {
        System.out.println("진입");
        System.out.println("code: " + code);
        System.out.println("state: " + state);
        // 1. 네이버 API로 Access Token 요청

        NaverUserInfo userInfo = naverLoginService.getUserInfo(code, state);

        /*
        NaverUserInfo userInfo = naverOAuthService.getUserInfo(code, state);

        // DB에 사용자 저장 or 조회
        User user = userService.registerOrLogin(userInfo);

        // JWT 발급
        String jwt = jwtProvider.createToken(user);

        // 쿠키에 JWT 저장 (httpOnly)
        Cookie cookie = new Cookie("ACCESS_TOKEN", jwt);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);



        return ResponseEntity.ok(user);
        */
        return null;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 1. 쿠키에서 refreshToken 꺼내기
            String refreshToken = extractRefreshTokenFromCookies(request);
            if (refreshToken == null) {
                return ResponseEntity.status(401).body(new LoginResponse(false, "리프레시 토큰 없음"));
            }

            // 2. refreshToken 검증 및 새로운 accessToken 발급
            LoginResponse loginResponse = authService.refreshAccessToken(refreshToken);

            if (!loginResponse.isResult()) {
                // refreshToken 만료 or 유효하지 않으면 쿠키 삭제
                Cookie expiredCookie = new Cookie("refreshToken", null);
                expiredCookie.setPath("/");
                expiredCookie.setHttpOnly(true);
                expiredCookie.setMaxAge(0);
                response.addCookie(expiredCookie);

                return ResponseEntity.status(401).body(loginResponse);
            }

            // 3. 성공 시 -> accessToken + user 정보 반환
            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new LoginResponse(false, "서버 오류"));
        }
    }

    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        var cleared = org.springframework.http.ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(0).build();
        return ResponseEntity.ok().header(org.springframework.http.HttpHeaders.SET_COOKIE, cleared.toString()).build();
    }

}
