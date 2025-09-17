package com.example.popic.user.controller;

import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.user.service.UserService;
import com.example.popic.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

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

    public record ApiRes(boolean result, String message, Long id) {
        public static ApiRes ok(Long id){ return new ApiRes(true, "가입 성공", id); }
        public static ApiRes fail(String m){ return new ApiRes(false, m, null); }
    }

}
