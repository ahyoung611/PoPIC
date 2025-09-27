package com.example.popic.file;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

public class FileSave {

    public static String fileSave(String type, MultipartFile file){
        String os = System.getProperty("os.name").toLowerCase();
        String home = System.getProperty("user.home");
        String uploadDir;
        try{
            if(os.contains("win")){
                uploadDir = "C:/" + type;
            }else{
                uploadDir = home + File.separator + type;
            }

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
            // 원본 이름에서 확장자 제거
            String baseName = (dotIndex != -1) ? originalName.substring(0, dotIndex) : originalName;

            String savedName = UUID.randomUUID() + "_" + baseName + ext;

            File destination = new File(uploadDir, savedName);
            file.transferTo(destination);

            return savedName;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
