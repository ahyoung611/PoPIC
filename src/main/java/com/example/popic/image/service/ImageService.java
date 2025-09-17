package com.example.popic.image.service;

import com.example.popic.entity.entities.Image;
import com.example.popic.image.dto.ImageDTO;
import com.example.popic.image.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImageService {
    private  final ImageRepository imageRepository;

    public ImageDTO findById(Long imageId) {
        Optional<Image> image = imageRepository.findById(imageId);

        return new ImageDTO(image);
    }
}
