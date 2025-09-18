package com.example.popic.board.controller;

import com.example.popic.board.dto.BoardCommentDTO;
import com.example.popic.board.service.BoardCommentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/board/{boardId}/comments")
public class BoardCommentController {

    private final BoardCommentService boardCommentService;

    // 댓글 목록
    @GetMapping
    public List<BoardCommentDTO> list(@PathVariable Long boardId) {
        return boardCommentService.getComments(boardId);
    }

    // 댓글 작성
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BoardCommentDTO create(
            @PathVariable Long boardId,
            @RequestBody CreateReq req
    ) {
        Long userId = 1L;
        return boardCommentService.addComment(boardId, userId, req.getContent(), req.getParentId());
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long boardId,
            @PathVariable Long commentId
    ) {
        Long userId = 1L;
        boardCommentService.deleteComment(boardId, commentId, userId);
    }

    @Data
    public static class CreateReq {
        private String content;
        private Long parentId;
    }
}
