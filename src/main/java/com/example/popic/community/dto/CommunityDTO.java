package com.example.popic.community.dto;

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

    public static CommunityDTO fromEntity(com.example.popic.entity.entities.Community community) {
        return CommunityDTO.builder()
                .boardId(community.getBoard_id())
                .title(community.getTitle())
                .content(community.getContent())
                .viewCount(community.getView_count())
                .createdAt(community.getCreated_at())
                .updatedAt(community.getUpdated_at())
                .deletedAt(community.getDeleted_at())
                .status(community.getStatus())
                .writerName(community.getUser().getName())
                .files(
                        community.getFiles().stream()
                                .map(CommunityImageDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .comments(
                        community.getComments().stream()
                                .map(CommunityCommentDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
