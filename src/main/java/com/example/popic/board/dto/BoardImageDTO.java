package com.example.popic.board.dto;

import com.example.popic.entity.entities.BoardImage;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardImageDTO {

    private Long imageId;
    private String originalName;
    private String savedName;

    public static BoardImageDTO fromEntity(BoardImage image) {
        return BoardImageDTO.builder()
                .imageId(image.getImage_id())
                .originalName(image.getOriginal_name())
                .savedName(image.getSaved_name())
                .build();
    }
}
