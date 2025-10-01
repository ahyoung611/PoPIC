package com.example.popic.vendor.service;

import com.example.popic.entity.entities.UserProfile;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.entity.entities.VendorProfile;
import com.example.popic.file.FileSave;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorProfileRepository;
import com.example.popic.vendor.repository.VendorRepository;
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
public class VendorProfileService {

    private final VendorRepository vendorRepository;
    private final VendorProfileRepository vendorProfileRepository;

    // 벤더 프로필 조회
    public VendorDTO getProfile(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));
        return new VendorDTO(vendor);
    }

    // 벤더 프로필 수정
    @Transactional
    public VendorDTO updateProfile(Long vendorId, VendorDTO dto) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        if (dto.getVendor_name() != null)  vendor.setVendor_name(dto.getVendor_name());
        if (dto.getManager_name() != null) vendor.setManager_name(dto.getManager_name());
        if (dto.getPhone_number() != null) vendor.setPhone_number(dto.getPhone_number());
        if (dto.getBrn() != null)          vendor.setBrn(dto.getBrn());
        if (dto.getPassword() != null)     vendor.setPassword(dto.getPassword());

        return new VendorDTO(vendor);
    }

    // 프로필 사진 조회
    public String getProfilePhotoUrl(Long vendorId) {
        // vendorId를 사용해 VendorProfile 엔티티를 찾습니다.
        return vendorProfileRepository.findByVendorVendor_Id(vendorId)
                // VendorProfile의 getId()로 profile_id를 가져와 URL을 만듭니다.
                .map(p -> "/images?id=" + p.getId() + "&type=vendorProfile")
                .orElse(null);
    }

    // 프로필 사진 업로드/교체
    @Transactional
    public VendorDTO uploadProfilePhoto(Long vendorId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is empty.");

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        String savedName = FileSave.fileSave("vendorProfile", file);

        VendorProfile profile = vendorProfileRepository.findByVendorVendor_Id(vendorId)
                .orElseGet(() -> {
                    VendorProfile newProfile = new VendorProfile();
                    newProfile.setVendor(vendor);
                    return newProfile;
                });

        if (profile.getSaved_name() != null) deletePhysical(profile.getSaved_name());

        profile.setOriginal_name(file.getOriginalFilename());
        profile.setSaved_name(savedName);

        vendorProfileRepository.save(profile);

        return new VendorDTO(vendor);  // DTO에 프로필 정보 포함
    }

    // 프로필 사진 삭제
    @Transactional
    public VendorDTO deleteProfilePhoto(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        vendorProfileRepository.findByVendorVendor_Id(vendorId).ifPresent(profile -> {
            // 물리적 파일 삭제
            deletePhysical(profile.getSaved_name());

            // 데이터베이스에서 해당 엔티티 삭제
            vendorProfileRepository.delete(profile);
        });

        return new VendorDTO(vendor);
    }

    // 물리 파일 삭제
    private void deletePhysical(String savedName) {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            String home = System.getProperty("user.home");
            Path basePath = os.contains("win") ? Paths.get("C:", "VendorProfile") : Paths.get(home, "VendorProfile");
            Path path = basePath.resolve(savedName);
            Files.deleteIfExists(path);
        } catch (Exception ignored) {}
    }

    // 프로필 사진 조회
    public VendorProfile getProfileByVendorId(Long vendorId) {
        return vendorProfileRepository.findByVendorVendor_Id(vendorId).orElse(null);
    }

    // 벤더 승인 재요청
    @Transactional
    public VendorDTO requestReapproval(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        // 상태 전이 규칙: REJECTED(3) -> PENDING(2)
        if (vendor.getStatus() != 3) {
            throw new IllegalStateException("현재 상태에서는 재심사 요청을 할 수 없습니다.");
        }

        vendor.setStatus(2); // 승인 대기
        // JPA dirty checking으로 flush
        return new VendorDTO(vendor);
    }

}
