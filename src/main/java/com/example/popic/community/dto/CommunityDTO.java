package com.example.popic.community.dto;

import com.example.popic.entity.entities.Board;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityDTO {

    private Long boardId;
    private String title;
    private String content;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private int status;

    private String writerName; // User.username
    private List<CommunityImageDTO> files; // 첨부파일
    private List<CommunityCommentDTO> comments; // 댓글 리스트

    public static CommunityDTO fromEntity(Board board) {
        return CommunityDTO.builder()
                .boardId(board.getBoard_id())
                .title(board.getTitle())
                .content(board.getContent())
                .viewCount(board.getView_count())
                .createdAt(board.getCreated_at())
                .updatedAt(board.getUpdated_at())
                .deletedAt(board.getDeleted_at())
                .status(board.getStatus())
                .writerName(board.getUser().getName())
                .files(
                        board.getFiles().stream()
                                .map(CommunityImageDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .comments(
                        board.getComments().stream()
                                .map(CommunityCommentDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
