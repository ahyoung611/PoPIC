package com.example.popic.auth.service;

import com.example.popic.admin.dto.AdminDTO;
import com.example.popic.admin.repository.AdminRepository;
import com.example.popic.auth.dto.LoginResponse;
import com.example.popic.security.JwtUtil;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final AdminRepository adminRepository;

    public LoginResponse refreshAccessToken(String refreshToken) {

        // 1. refreshToken 유효성 검증
        if (!jwtUtil.validateToken(refreshToken)) {
            System.out.println("리프레시 토큰 실패");
            return new LoginResponse(false, "리프레시 토큰이 유효하지 않습니다.");
        }


        // 2. refreshToken에서 userId 꺼내기
        String loginId = jwtUtil.getSubject(refreshToken);
        String newAccessToken;

        if(userRepository.existsLoginId(loginId)){
            UserDTO user = new UserDTO(userRepository.findByLoginId(loginId).orElse(null));
            newAccessToken = jwtUtil.createAccessToken(loginId, user.getRole().toString() ,user.getUser_id());
            return new LoginResponse(true, "재발급 성공", newAccessToken, user);
        }else if(vendorRepository.existsLoginId(loginId)){
            VendorDTO vendor = new VendorDTO(vendorRepository.findByLoginId(loginId).orElse(null));
            newAccessToken = jwtUtil.createAccessToken(loginId, vendor.getRole().toString() ,vendor.getVendor_id());
            return new LoginResponse(true, "재발급 성공", newAccessToken, vendor);
        }else{
            AdminDTO admin = new AdminDTO(adminRepository.findByLoginId(loginId).orElse(null));
            newAccessToken = jwtUtil.createAccessToken(loginId, admin.getRole().toString() ,admin.getAdmin_id());
            return new LoginResponse(true, "재발급 성공", newAccessToken, admin);
        }


    }
}
