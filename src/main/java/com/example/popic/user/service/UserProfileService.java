package com.example.popic.user.service;

import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.UserProfile;
import com.example.popic.file.FileSave;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.repository.UserProfileRepository;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    // 유저 프로필 조회
    public UserDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return new UserDTO(user);
    }

    // 유저 프로필 수정
    @Transactional
    public UserDTO updateProfile(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (dto.getName() != null)         user.setName(dto.getName());
        if (dto.getEmail() != null)        user.setEmail(dto.getEmail());
        if (dto.getPhone_number() != null) user.setPhone_number(dto.getPhone_number());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(dto.getPassword());
        }

        return new UserDTO(user);
    }

    // 프로필 사진 조회
    public String getProfilePhotoUrl(Long userId) {
        return userProfileRepository.findByUser_Id(userId)
                .map(p -> "/images/profile/" + p.getSaved_name())
                .orElse(null);
    }

    // 프로필 사진 업로드/교체
    @Transactional
    public UserDTO uploadProfilePhoto(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is empty.");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String savedName = FileSave.fileSave("profile", file);

        UserProfile profile = userProfileRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (profile.getSaved_name() != null) deletePhysical(profile.getSaved_name());

        profile.setOriginal_name(file.getOriginalFilename());
        profile.setSaved_name(savedName);

        userProfileRepository.save(profile);

        return new UserDTO(user);  // DTO에 프로필 정보 포함됨
    }

    // 프로필 사진 삭제
    @Transactional
    public UserDTO deleteProfilePhoto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        userProfileRepository.findByUser_Id(userId).ifPresent(profile -> {
            deletePhysical(profile.getSaved_name());
            profile.setOriginal_name(null);
            profile.setSaved_name(null);
            userProfileRepository.save(profile);
        });

        return new UserDTO(user);  // 삭제 후 DTO 반환
    }

    // 물리 파일 삭제
    private void deletePhysical(String savedName) {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            String home = System.getProperty("user.home");
            String base = os.contains("win") ? "C:/profile" : home + Path.of("profile");
            Path path = Paths.get(base.toString(), savedName);
            Files.deleteIfExists(path);
        } catch (Exception ignored) {}
    }
}
