package com.example.popic.board.service;

import com.example.popic.board.dto.BoardDTO;
import com.example.popic.board.repository.BoardImageRepository;
import com.example.popic.board.repository.BoardRepository;
import com.example.popic.entity.entities.Board;
import com.example.popic.entity.entities.BoardImage;
import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final BoardImageRepository boardImageRepository;

    @Transactional
    public BoardDTO save(BoardDTO dto, String username) {
        User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = new Board();
        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());
        board.setUser(user);
        board.setView_count(0);
        board.setStatus(1);

        // 첨부파일 처리
        if (dto.getFiles() != null) {
            List<BoardImage> images = dto.getFiles().stream()
                    .map(fileDto -> {
                        BoardImage img = new BoardImage();
                        img.setOriginal_name(fileDto.getOriginalName());
                        img.setSaved_name(fileDto.getSavedName());
                        img.setBoard(board);   // 연관관계 주입 중요!!
                        return img;
                    })
                    .toList();
            board.setFiles(images); // cascade=ALL 이면 같이 저장됨
        }

        Board saved = boardRepository.save(board);
        return BoardDTO.fromEntity(saved);
    }

    public BoardDTO update(Long id, BoardDTO dto, String loginId) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // 작성자 확인
        if (!board.getUser().getLogin_id().equals(loginId)) {
            throw new AccessDeniedException("수정 권한 없음");
        }

        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());
        return BoardDTO.fromEntity(boardRepository.save(board));
    }

    @Transactional(readOnly = true)
    public Page<Board> search(String keyword, Pageable pageable, String scope) {
        boolean empty = (keyword == null || keyword.isBlank());
        if (empty) return boardRepository.listAll(pageable);

        String k = keyword.trim();
        String s = (scope == null ? "tc" : scope.toLowerCase());
        return switch (s) {
            case "title", "t" -> boardRepository.searchByTitle(k, pageable);
            case "content", "c" -> boardRepository.searchByContent(k, pageable);
            default -> boardRepository.searchByTitleOrContent(k, pageable);
        };
    }

    @Transactional(readOnly = true)
    public List<BoardDTO> boards() {
        return boardRepository.findAll()
                .stream()
                .map(BoardDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public BoardDTO findByBoardId(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));
        return BoardDTO.fromEntity(board);
    }

    public void delete(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. id=" + id));

        if (board.getFiles() != null && !board.getFiles().isEmpty()) {
            for (BoardImage img : board.getFiles()) {
                boardImageRepository.delete(img);
            }
        }

        boardRepository.delete(board);
    }

    @Transactional
    public void increaseView(Long boardId) {
        boardRepository.increaseView(boardId);
    }

    @Transactional(readOnly = true)
    public Board findEntityById(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + id));
    }
}
