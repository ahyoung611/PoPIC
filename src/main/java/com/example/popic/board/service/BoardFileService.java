package com.example.popic.board.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardFileService {

    @Value("${app.upload-dir:uploads}") // 기본값 uploads
    private String uploadDir;

    public String store(MultipartFile file) {
        try {
            Files.createDirectories(Path.of(uploadDir));

            String original = Optional.ofNullable(file.getOriginalFilename()).orElse("file");
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot != -1) ext = original.substring(dot); // ".png"

            String savedName = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")
                    .format(LocalDateTime.now()) + "_" + UUID.randomUUID() + ext;

            Path target = Path.of(uploadDir, savedName);
            file.transferTo(target);

            return savedName;
        } catch (IOException e) {
            throw new UncheckedIOException("파일 저장 실패", e);
        }
    }

    public void delete(String savedName) throws IOException {
        Path target = Path.of(uploadDir, savedName);
        Files.deleteIfExists(target);
    }
}

