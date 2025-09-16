package com.example.popic.image;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageDTO {
    private Long image_id;
    private String original_name;
    private String saved_name;

    public ImageDTO(Long image_id,String saved_name) {
        this.image_id = image_id;
        this.saved_name = saved_name;
    }
}
