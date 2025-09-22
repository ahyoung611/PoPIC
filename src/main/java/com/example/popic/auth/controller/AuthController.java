package com.example.popic.auth.controller;

import com.example.popic.auth.dto.NaverUserInfo;
import com.example.popic.auth.service.NaverLoginService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final NaverLoginService naverLoginService;

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
}
