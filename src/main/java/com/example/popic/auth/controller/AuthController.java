package com.example.popic.auth.controller;


import com.example.popic.auth.dto.GoogleUserInfo;
import com.example.popic.auth.dto.KakaoUserInfo;
import com.example.popic.auth.dto.LoginResponse;
import com.example.popic.auth.dto.NaverUserInfo;
import com.example.popic.auth.service.AuthService;
import com.example.popic.auth.service.GoogleLoginService;
import com.example.popic.auth.service.KakaoLoginService;
import com.example.popic.auth.service.NaverLoginService;
import com.example.popic.entity.entities.User;
import com.example.popic.security.JwtUtil;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.user.service.UserService;
import com.example.popic.vendor.repository.VendorRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final NaverLoginService naverLoginService;
    private final GoogleLoginService googleLoginService;
    private final KakaoLoginService kakaoLoginService;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final AuthService authService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;
//    @Value("${google.redirect-uri}")
//    private String googleRedirectUri;


//    @GetMapping("/naver/callback")
//    public ResponseEntity<?> callback(@RequestParam String code, @RequestParam String state, HttpServletResponse response) {
//        // 1. 네이버 API로 Access Token 요청
//
//        NaverUserInfo userInfo = naverLoginService.getUserInfo(code, state);
//
//        /*
//        NaverUserInfo userInfo = naverOAuthService.getUserInfo(code, state);
//
//        // DB에 사용자 저장 or 조회
//        User user = userService.registerOrLogin(userInfo);
//
//        // JWT 발급
//        String jwt = jwtProvider.createToken(user);
//
//        // 쿠키에 JWT 저장 (httpOnly)
//        Cookie cookie = new Cookie("ACCESS_TOKEN", jwt);
//        cookie.setHttpOnly(true);
//        cookie.setPath("/");
//        response.addCookie(cookie);
//
//
//
//        return ResponseEntity.ok(user);
//        */
//        return null;
//    }

    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam("code") String code,
                              @RequestParam("state") String state,
                              HttpServletResponse response) throws Exception {

        System.out.println("네이버 콜백 도착, code = " + code + ", state = " + state);

        // 1) 네이버 유저 정보
        NaverUserInfo info = naverLoginService.getUserInfo(code, state);

        // 2) 없으면 가입, 있으면 조회 (메서드명은 프로젝트에 맞게)
        User u = userService.registerOrLoginFromNaver(info);

        // 3) JWT 발급
        String access  = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
        String refresh = jwtUtil.createRefreshToken(u.getLogin_id());

        // 4) refresh 토큰 httpOnly 쿠키로 심기
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true)
                .secure(false)      // 배포 HTTPS면 true
                .sameSite("Lax")
                .path("/")
                .maxAge(java.time.Duration.ofDays(14))
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 5) 프론트로 302 리다이렉트 (access는 쿼리로 전달)
        String redirect = frontendBaseUrl + "/main"
                + "?social=naver"
                + "&token=" + URLEncoder.encode(access, java.nio.charset.StandardCharsets.UTF_8)
                + "&name="  + URLEncoder.encode(u.getName() == null ? "" : u.getName(), java.nio.charset.StandardCharsets.UTF_8);

        response.setStatus(302);
        response.setHeader("Location", redirect);
    }


//    @PostConstruct
//    public void printGoogleRedirectUri() {
//        System.out.println("프론트 base-url     = " + frontendBaseUrl);
//        System.out.println("구글 redirect-uri   = " + googleRedirectUri);
//    }

    @GetMapping("/google/callback")
    public void googleCallback(@RequestParam("code") String code,
                               HttpServletResponse response) throws Exception {

        System.out.println("구글 콜백 도착, code = " + code);

        // 1) 구글 유저 정보
        GoogleUserInfo info = googleLoginService.getUserInfo(code);

        // 2) 없으면 가입, 있으면 조회
        User u = userService.registerOrLoginFromGoogle(info);

        // 3) JWT 발급
        String access = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
        String refresh = jwtUtil.createRefreshToken(u.getLogin_id());

        // 4) refresh 토큰 httpOnly 쿠키
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true)
                .secure(false)     // 배포 HTTPS면 true
                .sameSite("Lax")
                .path("/")
                .maxAge(java.time.Duration.ofDays(14))
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 5) 프론트로 302 리다이렉트 (access는 쿼리로 전달)
        String redirect = frontendBaseUrl + "/main"
                + "?social=google"
                + "&token=" + URLEncoder.encode(access, StandardCharsets.UTF_8)
                + "&name=" + URLEncoder.encode(u.getName() == null ? "" : u.getName(), StandardCharsets.UTF_8);

        response.setStatus(302);
        response.setHeader("Location", redirect);
    }

    @GetMapping("/kakao/callback")
    public void kakaoCallback(@RequestParam("code") String code,
                              @RequestParam(value="state", required=false) String state,
                              HttpServletResponse response) throws Exception {

        System.out.println("카카오 콜백 도착, code = " + code + ", state = " + state);

        // 1) 카카오 유저 정보
        KakaoUserInfo info = kakaoLoginService.getUserInfo(code, state);
        System.out.println("컨트롤러 내 서비스 왔다 갔다 : " + info);

        // 2) 없으면 가입, 있으면 조회
        User u = userService.registerOrLoginFromKakao(info);
        System.out.println("user 서비스 다녀옴 : " + u);

        // 3) JWT
        String access  = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
        String refresh = jwtUtil.createRefreshToken(u.getLogin_id());
        System.out.println("컨트롤러 jwt : " + access + refresh);

        // 4) refresh httpOnly 쿠키
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true)
                .secure(false)   // HTTPS면 true
                .sameSite("Lax")
                .path("/")
                .maxAge(java.time.Duration.ofDays(14))
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 5) 프론트로 302 (access는 쿼리로 전달)
        String redirect = frontendBaseUrl + "/main"
                + "?social=kakao"
                + "&token=" + URLEncoder.encode(access, StandardCharsets.UTF_8)
                + "&name="  + URLEncoder.encode(u.getName() == null ? "" : u.getName(), StandardCharsets.UTF_8);

        System.out.println("컨트롤러 리다이렉트");

        response.setStatus(302);
        response.setHeader("Location", redirect);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 1. 쿠키에서 refreshToken 꺼내기
            String refreshToken = extractRefreshTokenFromCookies(request);
            System.out.println(refreshToken);
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
