package com.example.popic.file;

import com.example.popic.entity.entities.ReviewImage;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

public class FileSave {

    public static String FileSave(String type, MultipartFile file){
        try{
            String uploadDir = "C:/" + type;
            File directory = new File(uploadDir);

            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created) {
                    throw new RuntimeException("폴더 생성 실패: " + uploadDir);
                }
            }

            // 파일 이름 만들기 (UUID + 원본 확장자)
            String originalName = file.getOriginalFilename();
            int dotIndex = originalName.lastIndexOf(".");
            String ext = (dotIndex != -1) ? originalName.substring(dotIndex) : "";
            String savedName = UUID.randomUUID() + "_" + originalName + ext;

            File destination = new File(uploadDir, savedName);
            file.transferTo(destination);

            return savedName;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }
}
