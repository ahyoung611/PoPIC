package com.example.popic.auth.service;

import com.example.popic.auth.dto.LoginResponse;
import com.example.popic.security.JwtUtil;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public LoginResponse refreshAccessToken(String refreshToken) {
        // 1. refreshToken 유효성 검증
        if (!jwtUtil.validateToken(refreshToken)) {
            System.out.println("리프레시 토큰 실패");
            return new LoginResponse(false, "리프레시 토큰이 유효하지 않습니다.");
        }


        // 2. refreshToken에서 userId 꺼내기
        String userId = jwtUtil.getSubject(refreshToken);
        System.out.println("userId = " + userId);
        UserDTO user = new UserDTO(userRepository.findByLoginId(userId).orElse(null));


        // 3. 새로운 accessToken 발급
        String newAccessToken = jwtUtil.createAccessToken(userId, user.getRole().toString() ,user.getUser_id());

        return new LoginResponse(true, "재발급 성공", newAccessToken, user);
    }
}
