package com.example.popic.image.dto;

import com.example.popic.entity.entities.Image;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Optional;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageDTO {
    private Long image_id;
    private String original_name;
    private String saved_name;

    public ImageDTO(Optional<Image> entity) {
        this.image_id = entity.get().getImage_id();
        this.saved_name = entity.get().getSaved_name();
    }
}
