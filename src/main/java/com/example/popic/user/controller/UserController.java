package com.example.popic.user.controller;

import com.example.popic.entity.entities.User;
import com.example.popic.security.JwtUtil;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



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
    public ResponseEntity<ApiRes> login(@RequestBody User req,
                                        @RequestParam(name = "keep", defaultValue = "false") boolean keep,
                                        HttpServletResponse response) { // 요청은 엔티티(User)
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
            Cookie refreshCookie = new Cookie("refreshToken", refresh);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setPath("/");

            // 배포 환경용 설정 추가
            refreshCookie.setSecure(true); // HTTPS에서만 전송
            refreshCookie.setAttribute("SameSite", "None"); // 크로스사이트 허용
            refreshCookie.setDomain(".http://13.209.99.96:5173");

            // 로그인유지(true) = 리프레시 쿠키 만료 시간 그대로, 로그인유지x(false) 세션쿠키(브라우저 종료 시 삭제)
            if (keep) {
                refreshCookie.setMaxAge((int) java.time.Duration.ofDays(14).getSeconds()); // 수정
            } else {
                refreshCookie.setMaxAge(-1);
            }
//            refreshCookie.setMaxAge((int) Duration.ofDays(14).getSeconds()); 기존 코드

            response.addCookie(refreshCookie);

            // 프론트로 응답
//            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, refreshCookie.toString()).body(ApiRes.okLogin("로그인 성공", access, dto));
            return ResponseEntity.ok(ApiRes.okLogin("로그인 성공", access, dto));

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

        // === 소셜 추가정보 완료 ===
    @PostMapping("/social/complete")
    public ResponseEntity<ApiRes> completeSocial(
            @RequestBody SocialCompleteReq req,
            org.springframework.security.core.Authentication authentication) {
                try {
                        // JwtFilter에서 넣어준 CustomUserPrincipal 사용
                        com.example.popic.CustomUserPrincipal principal =
                                        (com.example.popic.CustomUserPrincipal) authentication.getPrincipal();
                        Long userId = principal.getId();
                        User u = userService.updateSocialFields(userId, req.email(), req.name(), req.phone_number());

                        // 갱신된 정보로 새 access 토큰 발급(선택)
                        String access = jwtUtil.createAccessToken(u.getLogin_id(), String.valueOf(u.getRole()), u.getUser_id());
                        UserDTO dto = new UserDTO(u);
                        dto.setPassword(null);
                        return ResponseEntity.ok(ApiRes.okLogin("완료", access, dto));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
                    } catch (Exception e) {
                        return ResponseEntity.ok(ApiRes.fail("처리 중 오류가 발생했습니다."));
                    }
            }

            public record SocialCompleteReq(String email, String name, String phone_number) {}

}
