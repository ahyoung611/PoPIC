package com.example.popic.auth.controller;

import com.example.popic.auth.dto.NaverUserInfo;
import com.example.popic.auth.service.NaverLoginService;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
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
