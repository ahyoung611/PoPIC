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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    // 유저 프로필 조회 (UserProfile ID 기반)
    public UserProfile getProfileById(Long profileId) {
        return userProfileRepository.findById(profileId)
                .orElse(null);
    }

    // 유저 프로필 조회 (User ID 기반)
    public UserDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Optional<UserProfile> profileOpt = userProfileRepository.findByUser_Id(userId);
        boolean avatarExists = profileOpt.isPresent() && profileOpt.get().getSaved_name() != null;

        UserDTO dto = new UserDTO(user);
        dto.setAvatarExists(avatarExists);
        return dto;
    }

    // 유저 프로필 수정
    @Transactional
    public UserDTO updateProfile(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (dto.getName() != null)         user.setName(dto.getName());
        if (dto.getEmail() != null)        user.setEmail(dto.getEmail());
        if (dto.getPhone_number() != null) user.setPhone_number(dto.getPhone_number());

        return new UserDTO(user);
    }


    // 프로필 사진 조회
//     public String getProfilePhotoUrl(Long userId) {
//         return userProfileRepository.findByUser_Id(userId)
//                 .map(p -> "/images?id=" + p.getId() + "&type=userProfile")
//                 .orElse(null);
//     }

    // 프로필 사진 업로드/교체
    @Transactional
    public UserDTO uploadProfilePhoto(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is empty.");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String savedName = FileSave.fileSave("userProfile", file);

        UserProfile profile = userProfileRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (profile.getSaved_name() != null) deletePhysical(profile.getSaved_name(), "userProfile");

        profile.setOriginal_name(file.getOriginalFilename());
        profile.setSaved_name(savedName);

        userProfileRepository.save(profile);

        UserDTO dto = new UserDTO(user);
        dto.setAvatarExists(true);
        return dto;
    }

    // 프로필 사진 삭제
    @Transactional
    public UserDTO deleteProfilePhoto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        userProfileRepository.findByUser_Id(userId).ifPresent(profile -> {
            deletePhysical(profile.getSaved_name(), "userProfile");
            userProfileRepository.delete(profile);
        });

        UserDTO dto = new UserDTO(user);
        dto.setAvatarExists(false);
        return dto;
    }

    // 회원 탈퇴
    @Transactional
    public void deleteProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // 프로필 사진 삭제
        deleteProfilePhoto(userId);

        // 유저 정보 삭제
        userRepository.delete(user);
    }

    // 물리 파일 삭제
    private void deletePhysical(String savedName, String directory) {
        if (savedName == null) return;
        try {
            String os = System.getProperty("os.name").toLowerCase();
            String home = System.getProperty("user.home");
            Path basePath = os.contains("win") ? Paths.get("C:", directory) : Paths.get(home, directory);
            Path path = basePath.resolve(savedName);
            Files.deleteIfExists(path);
        } catch (Exception ignored) {}
    }

    // 프로필 사진 물리적 경로 반환
    public Path getProfilePhotoPath(Long userId) {
        return userProfileRepository.findByUser_Id(userId)
                .map(profile -> {
                    if (profile.getSaved_name() == null) return null;
                    String os = System.getProperty("os.name").toLowerCase();
                    String home = System.getProperty("user.home");
                    String directory = "userProfile";
                    Path basePath = os.contains("win") ? Paths.get("C:", directory) : Paths.get(home, directory);
                    return basePath.resolve(profile.getSaved_name());
                })
                .orElse(null);
    }
}
