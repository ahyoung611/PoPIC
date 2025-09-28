package com.example.popic.admin.controller;

import com.example.popic.admin.repository.AdminRepository;
import com.example.popic.entity.entities.Admin;
import com.example.popic.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 관리자 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String, String> req) {
        System.out.println("어드민 로그인 진입?");
        String loginId = req.get("login_id");
        String password = req.get("password");

        Admin admin = adminRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 관리자입니다."));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // ROLE=ADMIN 토큰
        String token = jwtUtil.createAccessToken(admin.getLogin_id(), "ADMIN", admin.getAdmin_id());

        // 추가: 프론트의 user/vendor와 동일한 키(user)에 담아 반환 (role 포함)
        Map<String,Object> body = new HashMap<>();
        body.put("result", true);
        body.put("message", "OK");
        body.put("token", token);
        Map<String,Object> userLike = new HashMap<>();
        userLike.put("id", admin.getAdmin_id());
        userLike.put("login_id", admin.getLogin_id());
        userLike.put("role", "ADMIN");
        body.put("user", userLike);
        return ResponseEntity.ok(body);
    }
}
