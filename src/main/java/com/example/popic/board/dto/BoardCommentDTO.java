package com.example.popic.board.dto;

import com.example.popic.entity.entities.BoardComment;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardCommentDTO {

    private Long commentId;
    private String content;
    private String writerName;  // User.username
    private String writerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private int status;

    private Long parentId; // 부모 댓글 ID
    private List<BoardCommentDTO> replies; // 대댓글 리스트

    public static BoardCommentDTO fromEntity(BoardComment comment) {
        return BoardCommentDTO.builder()
                .commentId(comment.getComment_id())
                .content(comment.getContent())
                .writerName(comment.getUser().getName())
                .writerId(comment.getUser().getLogin_id())
                .createdAt(comment.getCreated_at())
                .updatedAt(comment.getUpdated_at())
                .deletedAt(comment.getDeleted_at())
                .status(comment.getStatus())
                .parentId(comment.getParent() != null ? comment.getParent().getComment_id() : null)
                .replies(
                        comment.getReplies().stream()
                                .map(BoardCommentDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
