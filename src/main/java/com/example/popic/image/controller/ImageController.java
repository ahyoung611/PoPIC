package com.example.popic.image.controller;

import com.example.popic.image.dto.ImageDTO;
import com.example.popic.image.dto.ReviewImageDTO;
import com.example.popic.image.service.ImageService;
import com.example.popic.image.service.ReviewImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;
    private final ReviewImageService reviewImageService;

    @GetMapping
    public ResponseEntity<byte[]> getImage(@RequestParam(name = "id") Long imageId,
                                           @RequestParam(name = "type")String type) {
        System.out.println("type: " + type);
        System.out.println("id: " + imageId);

        // imageId로 이미지 정보 조회
        switch (type) {
            case "popup":
                ImageDTO image = imageService.findById(imageId);
                return getImageFile(type, image.getSaved_name());
            case "review":
                ReviewImageDTO reviewImage = reviewImageService.findById(imageId);
                return getImageFile(type, reviewImage.getSaved_name());
            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }

    }

    public ResponseEntity<byte[]> getImageFile(String type, String savedName) {
        // 실제 저장된 파일 읽기
        Path imagePath = Path.of("C:/"+ type + "/", savedName); // 실제 저장된 위치
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
