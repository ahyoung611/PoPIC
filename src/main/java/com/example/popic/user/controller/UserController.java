package com.example.popic.user.controller;

import com.example.popic.entity.entities.User;
import com.example.popic.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestBody User user) {
        Long id = userService.joinUser(user);
        return ResponseEntity.ok(new ApiRes("OK", id));
    }

    public record ApiRes(String status, Long id) {}
}
