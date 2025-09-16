package com.example.popic.community.dto;

import com.example.popic.entity.entities.BoardImage;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityImageDTO {

    private Long imageId;
    private String originalName;
    private String savedName;

    public static CommunityImageDTO fromEntity(BoardImage image) {
        return CommunityImageDTO.builder()
                .imageId(image.getImage_id())
                .originalName(image.getOriginal_name())
                .savedName(image.getSaved_name())
                .build();
    }
}
