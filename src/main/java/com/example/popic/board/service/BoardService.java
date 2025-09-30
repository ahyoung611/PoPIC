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

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Transactional
    public BoardDTO update(Long id, BoardDTO dto, String loginId) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        if (!board.getUser().getLogin_id().equals(loginId)) {
            throw new AccessDeniedException("수정 권한 없음");
        }

        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());

        Set<String> incoming = (dto.getFiles()==null)
                ? Collections.emptySet()
                : dto.getFiles().stream()
                .map(f -> f.getSavedName())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        board.getFiles().removeIf(img -> !incoming.contains(img.getSaved_name()));

        Set<String> current = board.getFiles().stream()
                .map(BoardImage::getSaved_name)
                .collect(Collectors.toSet());

        if (dto.getFiles()!=null) {
            for (var f : dto.getFiles()) {
                String sn = f.getSavedName();
                if (sn==null || current.contains(sn)) continue;

                BoardImage img = new BoardImage();
                img.setOriginal_name(f.getOriginalName());
                img.setSaved_name(sn);
                img.setBoard(board);
                board.getFiles().add(img);
            }
        }

        return BoardDTO.fromEntity(board);
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

    public Page<Board> findByUserId(Long userId, Pageable pageable) {
        return boardRepository.findBoardsByUserId(userId, pageable);
    }
}
