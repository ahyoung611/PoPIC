package com.example.popic.image.controller;

import com.example.popic.board.dto.BoardImageDTO;
import com.example.popic.board.service.BoardFileService;
import com.example.popic.entity.entities.UserProfile;
import com.example.popic.entity.entities.VendorProfile;
import com.example.popic.image.dto.ImageDTO;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.service.ImageService;
import com.example.popic.image.service.ReviewImageService;
import com.example.popic.user.service.UserProfileService;
import com.example.popic.vendor.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;
    private final ReviewImageService reviewImageService;
    private final BoardFileService boardFileService;
    private final UserProfileService userProfileService;
    private final VendorProfileService vendorProfileService;

    @GetMapping
    public ResponseEntity<byte[]> getImage(@RequestParam(name = "id") Long imageId,
                                           @RequestParam(name = "type") String type) {

        // imageId로 이미지 정보 조회
        switch (type) {
            case "popup":
                ImageDTO image = imageService.findById(imageId);
                return getImageFile(type, image.getSaved_name());

            case "review":
                ReviewImageDTO reviewImage = reviewImageService.findById(imageId);
                return getImageFile(type, reviewImage.getSaved_name());

            case "upload":
                BoardImageDTO boardImageDTO = boardFileService.findById(imageId);
                return getImageFile(type, boardImageDTO.getSavedName());

            case "userProfile":
                UserProfile userProfile = userProfileService.getProfileById(imageId);
                if (userProfile != null && userProfile.getSaved_name() != null) {
                    return getImageFile("userProfile", userProfile.getSaved_name());
                }

            case "vendorProfile":

                VendorProfile vendorProfile = vendorProfileService.getProfileByVendorId(imageId);

                if (vendorProfile != null && vendorProfile.getSaved_name() != null) {
                    return getImageFile("vendorProfile", vendorProfile.getSaved_name());
                }

            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }
    }

    public ResponseEntity<byte[]> getImageFile(String type, String savedName) {
        String os = System.getProperty("os.name").toLowerCase();
        String home = System.getProperty("user.home");
        Path imagePath;

        if(os.contains("win")){
            imagePath = Path.of("C:/" + type + "/", savedName);
        }else{
            imagePath = Path.of(home,type, savedName);
            System.out.println(imagePath.toString());
        }

        try {
            byte[] imageBytes = Files.readAllBytes(imagePath);

            // Content-Type 동적으로 설정
            String contentType = Files.probeContentType(imagePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

}