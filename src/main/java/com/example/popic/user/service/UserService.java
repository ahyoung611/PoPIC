package com.example.popic.user.service;

import com.example.popic.auth.dto.GoogleUserInfo;
import com.example.popic.auth.dto.NaverUserInfo;
import com.example.popic.entity.entities.ROLE;
import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountUserVendorService accountUserVendorService;

    public Long joinUser(User user) {
        accountUserVendorService.assertLoginIdAvailable(user.getLogin_id());
        accountUserVendorService.assertUserEmailAvailable(user.getEmail());

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setPoint(0);
        user.setRole(ROLE.USER);
        user.setStatus(1);

        return userRepository.save(user).getUser_id();
    }

    public User registerOrLoginFromGoogle(GoogleUserInfo info) {
        String oauthLoginId = "google_" + info.getId();

        // 1) login_id로 먼저 조회
        var exist = userRepository.findByLoginId(oauthLoginId);
        if (exist.isPresent()) return exist.get();

        // 2) 신규 가입
        User u = new User();
        u.setLogin_id(oauthLoginId);
        u.setPassword(passwordEncoder.encode("oauth-" + UUID.randomUUID())); // 소셜용 더미 PW
        u.setRole(ROLE.USER);
        u.setStatus(1);
        u.setPoint(0);

        // 이메일: 중복이면 null 또는 대체 이메일
        String email = info.getEmail();
        if (email != null && userRepository.existsEmail(email)) {
            // unique 제약이 있다면 중복 저장 금지
            email = null; // 또는: email = oauthLoginId + "@google.local";
        }
        u.setEmail(email);

        // 이름
        String name = (info.getName() != null && !info.getName().isBlank())
                ? info.getName()
                : (String.join(" ",
                info.getGivenName() != null ? info.getGivenName() : "",
                info.getFamilyName() != null ? info.getFamilyName() : "").trim());
        u.setName((name == null || name.isBlank()) ? "GoogleUser" : name);

        return userRepository.save(u);
    }

    // UserService 내 (구글 메서드와 나란히 배치)
    public User registerOrLoginFromNaver(NaverUserInfo info) {
        if (info == null || info.getId() == null || info.getId().isBlank()) {
            throw new IllegalArgumentException("Naver userinfo id is missing");
        }

        // 로그인 아이디(고유)
        String oauthLoginId = "naver_" + info.getId();
        var exist = userRepository.findByLoginId(oauthLoginId);
        if (exist.isPresent()) return exist.get();

        // 신규 가입
        User u = new User();
        u.setLogin_id(oauthLoginId);
        u.setPassword(passwordEncoder.encode("oauth-" + java.util.UUID.randomUUID())); // 소셜용 더미 PW
        u.setRole(ROLE.USER);
        u.setStatus(1);
        u.setPoint(0);

        // 이메일
        String email = info.getEmail();
        boolean emailInvalid = (email == null || email.isBlank());
        boolean emailDup = (!emailInvalid && userRepository.existsEmail(email));
        if (emailInvalid || emailDup) {
            email = oauthLoginId + "@naver.local";   // 예: naver_abc123@naver.local
        }
        u.setEmail(email);

        // 이름 -> 없으면 닉네임
        String name = (info.getName() != null && !info.getName().isBlank())
                ? info.getName()
                : (info.getNickname() != null && !info.getNickname().isBlank()
                ? info.getNickname()
                : "NaverUser");
        u.setName(name);

        // 휴대폰
         if (info.getMobile() != null) u.setPhone_number(info.getMobile());

        return userRepository.save(u);
    }


}
