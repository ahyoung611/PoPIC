package com.example.popic.image.controller;

import com.example.popic.image.dto.ImageDTO;
import com.example.popic.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @GetMapping("/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) {

        // imageId로 이미지 정보 조회
        ImageDTO image = imageService.findById(imageId);


        // 실제 저장된 파일 읽기
        Path imagePath = Path.of("C:/upload/", image.getSaved_name()); // 실제 저장된 위치
        try {
            byte[] imageBytes = java.nio.file.Files.readAllBytes(imagePath);

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
