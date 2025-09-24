package com.example.popic.board.dto;

import com.example.popic.entity.entities.Board;
import com.example.popic.entity.entities.BoardImage;
import lombok.*;

import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardImageDTO {

    private Long imageId;
    private String originalName;
    private String savedName;
    private String url;

    public static BoardImageDTO fromEntity(BoardImage image) {
        return BoardImageDTO.builder()
                .imageId(image.getImage_id())
                .originalName(image.getOriginal_name())
                .savedName(image.getSaved_name())
                .url("/board/file/" + image.getSaved_name())
                .build();
    }

    public BoardImageDTO(Optional<BoardImage> image) {
        this.imageId = image.get().getImage_id();
        this.originalName = image.get().getOriginal_name();
        this.savedName = image.get().getSaved_name();
        this.url = "/board/file/" + image.get().getSaved_name();
    }
}
