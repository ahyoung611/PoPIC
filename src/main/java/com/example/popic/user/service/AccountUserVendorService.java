package com.example.popic.user.service;

import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountUserVendorService {
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

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
}
