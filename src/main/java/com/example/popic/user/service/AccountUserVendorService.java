package com.example.popic.user.service;

import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountUserVendorService {
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    /* user/vendor login_id 중복확인  */
    public void assertLoginIdAvailable(String loginId) {
        boolean taken = userRepository.existsLoginId(loginId) || vendorRepository.existsLoginId(loginId);
        if (taken) throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
    }

    /* user email */
    public void assertUserEmailAvailable(String email) {
        if (userRepository.existsEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }

    /* vendor 사업자등록번호 */
    public void assertBrnAvailable(String brn) {
        if (vendorRepository.existsBrn(brn)) {
            throw new IllegalArgumentException("이미 등록된 사업자등록번호입니다.");
        }
    }

    // ====== 여기부터 로그인 인증 로직 추가 ======

    // User 인증: 존재/비번/상태 체크, 통과 시 엔티티 반환
    public User authenticateUser(String loginId, String rawPassword) {
        User u = userRepository.findByLoginId(loginId) // ★
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));
        if (u.getPassword() == null || !passwordEncoder.matches(rawPassword, u.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        if (u.getStatus() == 0)  throw new IllegalStateException("정지된 계정입니다.");
        if (u.getStatus() == -1) throw new IllegalStateException("탈퇴 처리된 계정입니다.");
        return u;
    }

    // Vendor 인증: 존재/비번/상태 체크, 통과 시 엔티티 반환
    public Vendor authenticateVendor(String loginId, String rawPassword) {
        Vendor v = vendorRepository.findByLoginId(loginId) // ★
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));
        if (v.getPassword() == null || !passwordEncoder.matches(rawPassword, v.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        // 2: 승인대기, 1: 정상, 0: 정지, -1: 탈퇴, 3: 가입 반려
//        if (v.getStatus() == 2)  throw new IllegalStateException("승인 대기 중인 계정입니다.");
        if (v.getStatus() == 0)  throw new IllegalStateException("정지된 계정입니다.");
        if (v.getStatus() == -1) throw new IllegalStateException("탈퇴 처리된 계정입니다.");
//        if (v.getStatus() == 3)  throw new IllegalStateException("가입이 반려된 계정입니다.");
        return v;
    }
}
