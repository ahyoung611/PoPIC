package com.example.popic.user.service;

import com.example.popic.entity.entities.ROLE;
import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Long joinUser(User user) {
        if (userRepository.existsByLogin_id(user.getLogin_id())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(ROLE.USER);
        user.setStatus(1);
        return userRepository.save(user).getUser_id();
    }
}
