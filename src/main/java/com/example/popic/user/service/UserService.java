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
}
