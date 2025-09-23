package com.example.popic.auth.controller;

import com.example.popic.auth.dto.GoogleUserInfo;
import com.example.popic.auth.dto.NaverUserInfo;
import com.example.popic.auth.service.GoogleLoginService;
import com.example.popic.auth.service.NaverLoginService;
import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.user.service.UserService;
import com.example.popic.vendor.repository.VendorRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// 리프레시 토큰용
import com.example.popic.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

// 구글 연동
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final NaverLoginService naverLoginService;
    private final GoogleLoginService googleLoginService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserService userService;
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

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${google.redirect-uri}")
    private String googleRedirectUri;

    @PostConstruct
    public void printGoogleRedirectUri() {
        System.out.println("프론트 base-url     = " + frontendBaseUrl);
        System.out.println("구글 redirect-uri   = " + googleRedirectUri);
    }

    @GetMapping("/google/callback")
    public void googleCallback(@RequestParam("code") String code,
                               HttpServletResponse response) throws Exception {

        System.out.println("✅ 구글 콜백 도착, code = " + code);

        // 1) 구글 유저 정보
        GoogleUserInfo info = googleLoginService.getUserInfo(code);

        // 2) 없으면 가입, 있으면 조회
        User u = userService.registerOrLoginFromGoogle(info);

        // 3) JWT 발급
        String access  = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
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
        String redirect = frontendBaseUrl + "/?social=google"
                + "&token=" + URLEncoder.encode(access, StandardCharsets.UTF_8)
                + "&name=" + URLEncoder.encode(u.getName() == null ? "" : u.getName(), StandardCharsets.UTF_8);

        response.setStatus(302);
        response.setHeader("Location", redirect);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String rt) {
        if (rt == null) return ResponseEntity.status(401).body(Map.of("error","no_refresh"));
        try {
            Claims c = jwtUtil.parse(rt).getBody();
            if (!"refresh".equals(c.get("typ", String.class))) {
                return ResponseEntity.status(401).body(Map.of("error","invalid_type"));
            }
            String loginId = c.getSubject();

            // 1) 유저 먼저
            var uOpt = userRepository.findByLoginId(loginId);
            if (uOpt.isPresent()) {
                var u = uOpt.get();
                if (u.getStatus() == 0)  return ResponseEntity.status(401).body(Map.of("error","suspended"));
                if (u.getStatus() == -1) return ResponseEntity.status(401).body(Map.of("error","deleted"));
                String access = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
                return ResponseEntity.ok(Map.of("result", true, "token", access));
            }

            // 2) 없으면 벤더
            var vOpt = vendorRepository.findByLoginId(loginId);
            if (vOpt.isPresent()) {
                var v = vOpt.get();
                if (v.getStatus() == 0)  return ResponseEntity.status(401).body(Map.of("error","suspended"));
                if (v.getStatus() == -1) return ResponseEntity.status(401).body(Map.of("error","deleted"));
                String access = jwtUtil.createAccessToken(v.getLogin_id(), String.valueOf(v.getRole()), v.getVendor_id());
                return ResponseEntity.ok(Map.of("result", true, "token", access));
            }

            return ResponseEntity.status(401).body(Map.of("error","unknown_subject"));
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("error","invalid_refresh"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        var cleared = org.springframework.http.ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(0).build();
        return ResponseEntity.ok().header(org.springframework.http.HttpHeaders.SET_COOKIE, cleared.toString()).build();
    }


}
