package com.example.popic.user.service;

import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.user.dto.UserPasswordDto;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.dto.VendorPasswordDto;
import com.example.popic.vendor.repository.VendorRepository;
import jakarta.transaction.Transactional;
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
        if (u.getStatus() == 0)  throw new IllegalStateException("정지된 계정입니다.\n관리자에게 문의 부탁드립니다.\n문의 번호: 02) 321-4567");
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
        if (v.getStatus() == 0)  throw new IllegalStateException("정지된 계정입니다.\n관리자에게 문의 부탁드립니다.\n문의 번호: 02) 321-4567");
        if (v.getStatus() == -1) throw new IllegalStateException("탈퇴 처리된 계정입니다.");
//        if (v.getStatus() == 3)  throw new IllegalStateException("가입이 반려된 계정입니다.");
        return v;
    }


    // young 유저 마이페이지 비밀번호
    @Transactional
    public void changeUserPassword(Long userId, UserPasswordDto req) {
        // 입력값 존재
        if(req == null) throw  new IllegalArgumentException("요청이 올바르지 않습니다.");
        if(req.currentPassword() == null || req.currentPassword().trim().isEmpty())
            throw new IllegalArgumentException("현재 비밀번호를 입력해 주세요.");
        if(req.newPassword() == null || req.newPassword().trim().isEmpty())
            throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
        if(req.confirmNewPassword() == null || req.confirmNewPassword().trim().isEmpty())
            throw new IllegalArgumentException("새 비밀번호를 확인해 주세요.");

        User u = userRepository.findById(userId).orElseThrow(()-> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 현재 비밀번호 일치
        if (u.getPassword() == null || !passwordEncoder.matches(req.currentPassword(), u.getPassword())){
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        // 확인 비밀번호 일치
        if(!req.newPassword().equals(req.confirmNewPassword())) {
            throw new IllegalArgumentException("새 비밀번호와 확인 값이 일치하지 않습니다.");
        }

        // 기존과 동일 x
        if(passwordEncoder.matches(req.newPassword(), u.getPassword())) {
            throw new IllegalArgumentException("기존 비밀번호와 동일합니다. 다른 비밀번호를 입력해 주세요.");
        }

        // 새 비밀번호 검사
        validatePasswordPolicy(req.newPassword(), u.getLogin_id());

        // 암호화 저장
        u.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(u);
    }

    // young 벤더 마이페이지 비밀번호
    @Transactional
    public void changeVendorPassword(Long userId, VendorPasswordDto req) {
        // 입력값 존재
        if(req == null) throw  new IllegalArgumentException("요청이 올바르지 않습니다.");
        if(req.currentPassword() == null || req.currentPassword().trim().isEmpty())
            throw new IllegalArgumentException("현재 비밀번호를 입력해 주세요.");
        if(req.newPassword() == null || req.newPassword().trim().isEmpty())
            throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
        if(req.confirmNewPassword() == null || req.confirmNewPassword().trim().isEmpty())
            throw new IllegalArgumentException("새 비밀번호를 확인해 주세요.");

        Vendor v = vendorRepository.findById(userId).orElseThrow(()-> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 현재 비밀번호 일치
        if (v.getPassword() == null || !passwordEncoder.matches(req.currentPassword(), v.getPassword())){
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        // 확인 비밀번호 일치
        if(!req.newPassword().equals(req.confirmNewPassword())) {
            throw new IllegalArgumentException("새 비밀번호와 확인 값이 일치하지 않습니다.");
        }

        // 기존과 동일 x
        if(passwordEncoder.matches(req.newPassword(), v.getPassword())) {
            throw new IllegalArgumentException("기존 비밀번호와 동일합니다. 다른 비밀번호를 입력해 주세요.");
        }

        // 새 비밀번호 검사
        validatePasswordPolicy(req.newPassword(), v.getLogin_id());

        // 암호화 저장
        v.setPassword(passwordEncoder.encode(req.newPassword()));
        vendorRepository.save(v);
    }



    // young 공통 비밀번호
    private void validatePasswordPolicy(String pwd, String loginId) {
        // 길이
        if (pwd == null || pwd.length() < 8 || pwd.length() > 64) {
            throw new IllegalArgumentException("비밀번호는 문자, 숫자, 특수문자를 모두 포함 8~64자여야 합니다.");
        }

        // 공백 x
        if (pwd.chars().anyMatch(Character::isWhitespace)) {
            throw new IllegalArgumentException("비밀번호에 공백은 사용할 수 없습니다.");
        }

        // 문자(알파벳) + 숫자 + 특수문자 모두 포함
        boolean hasLetter  = pwd.matches(".*[A-Za-z].*");
        boolean hasDigit   = pwd.matches(".*\\d.*");
        boolean hasSpecial = pwd.matches(".*[^A-Za-z0-9].*");

        if (!(hasLetter && hasDigit && hasSpecial)) {
            throw new IllegalArgumentException("비밀번호는 문자, 숫자, 특수문자를 모두 포함해야 합니다.");
        }

        // 동일 문자 3회 이상 연속 x
        if (pwd.matches(".*(.)\\1\\1.*")) {
            throw new IllegalArgumentException("같은 문자를 3회 이상 연속 사용할 수 없습니다.");
        }

        // 아이디 포함 x
        if (loginId != null && !loginId.isBlank()) {
            if (pwd.toLowerCase().contains(loginId.toLowerCase())) {
                throw new IllegalArgumentException("비밀번호에 아이디를 포함할 수 없습니다.");
            }
        }
    }
}