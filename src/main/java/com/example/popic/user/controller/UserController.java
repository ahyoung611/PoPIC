package com.example.popic.user.controller;

import com.example.popic.entity.entities.User;
import com.example.popic.security.JwtUtil;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;


@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final AccountUserVendorService accountUserVendorService;
    private final JwtUtil jwtUtil;

    @PostMapping("/join")
    public ResponseEntity<ApiRes> join(@RequestBody User user) {
        try {
            // 회원 가입
            Long id = userService.joinUser(user);
            return ResponseEntity.ok(ApiRes.ok(id));
        } catch (DataIntegrityViolationException e) {
            // 동시 가입시 중복 방지
            return ResponseEntity.ok(ApiRes.fail("이미 사용 중인 아이디 또는 이메일입니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        } catch (Exception e) {
            // 기타 예외
            return ResponseEntity.ok(ApiRes.fail("가입 처리 중 오류가 발생했습니다."));
        }

    }


    @PostMapping("/login")
    public ResponseEntity<ApiRes> login(@RequestBody User req) { // 요청은 엔티티(User)
        try {
            if (req.getLogin_id() == null || req.getPassword() == null) {
                return ResponseEntity.ok(ApiRes.fail("요청 형식이 올바르지 않습니다."));
            }

            User u = accountUserVendorService.authenticateUser(req.getLogin_id(), req.getPassword());

            UserDTO dto = new UserDTO(u);
            dto.setRole(u.getRole());
            dto.setStatus(u.getStatus());
            if (u.getUser_profile() != null) {
                dto.setUser_profile(u.getUser_profile().getProfile_id());
            }
            dto.setPassword(null);

            // 토큰 생성 (액세스, 리프레시 각 분리)
            String access = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
            String refresh = jwtUtil.createRefreshToken(u.getLogin_id());

            // 리프레시 토큰 - http only 쿠키
            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refresh).httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(Duration.ofDays(14)).build();

            // 프론트로 응답
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, refreshCookie.toString()).body(ApiRes.okLogin("로그인 성공", access, dto));


        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiRes.fail("로그인 처리 중 오류가 발생했습니다."));
        }


    }

    public record ApiRes(boolean result, String message, Long id, String token, Object user) {
        public static ApiRes ok(Long id) {
            return new ApiRes(true, "가입 성공", id, null, null);
        }

        public static ApiRes okLogin(String m, String token, Object user) {
            return new ApiRes(true, m, null, token, user);
        }

        public static ApiRes fail(String m) {
            return new ApiRes(false, m, null, null, null);
        }
    }

}
