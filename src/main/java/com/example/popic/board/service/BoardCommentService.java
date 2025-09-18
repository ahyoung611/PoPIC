package com.example.popic.board.service;

import com.example.popic.board.dto.BoardCommentDTO;
import com.example.popic.board.repository.BoardCommentRepository;
import com.example.popic.board.repository.BoardRepository;
import com.example.popic.entity.entities.Board;
import com.example.popic.entity.entities.BoardComment;
import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardCommentService {

    private final BoardCommentRepository boardCommentRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public List<BoardCommentDTO> getComments(Long boardId) {
        return boardCommentRepository.findAllByBoardIdFlat(boardId)
                .stream().map(BoardCommentDTO::fromEntity).toList();
    }

    @Transactional
    public BoardCommentDTO addComment(Long boardId, Long userId, String content, Long parentId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        BoardComment parent = null;
        if (parentId != null) {
            parent = boardCommentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("상위 댓글이 존재하지 않습니다."));

            // 대댓글 금지: 부모가 이미 자식이면 막기
            if (parent.getParent() != null) {
                throw new IllegalArgumentException("대댓글은 허용되지 않습니다.");
            }
            // 다른 게시글 댓글에 붙이는 것 방지
            if (!parent.getBoard().getBoardId().equals(boardId)) {
                throw new IllegalArgumentException("다른 게시글의 댓글에는 답글을 달 수 없습니다.");
            }
        }

        BoardComment comment = new BoardComment();
        comment.setBoard(board);
        comment.setUser(user);
        comment.setContent(content);
        comment.setParent(parent);

        return BoardCommentDTO.fromEntity(boardCommentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long boardId, Long commentId, Long userId) {
        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));
        System.out.printf("삭제 시도: boardId=%d, commentId=%d, DB.boardId=%d, DB.userId=%d%n",
                boardId, commentId, comment.getBoard().getBoardId(), comment.getUser().getUser_id());

        if (!comment.getBoard().getBoardId().equals(boardId)) {
            throw new RuntimeException("게시글과 댓글이 일치하지 않습니다.");
        }
//        if (!comment.getUser().getUser_id().equals(userId)) {
//            throw new RuntimeException("본인 댓글만 삭제할 수 있습니다.");
//        } // 로그인 미구현이라 추후 구현해야됨!

        comment.setStatus(-1);
        comment.setDeleted_at(java.time.LocalDateTime.now());
    }
}
