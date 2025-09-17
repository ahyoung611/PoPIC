package com.example.popic.board.service;

import com.example.popic.board.dto.BoardDTO;
import com.example.popic.board.repository.BoardRepository;
import com.example.popic.entity.entities.Board;
import com.example.popic.entity.entities.BoardImage;
import com.example.popic.entity.entities.User;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Transactional
    public BoardDTO save(BoardDTO dto) {
        // 임시 사용자 - 나중에 꼭 수정해야됨
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("기본 사용자 없음"));

        Board board = new Board();
        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());
        board.setUser(user);
        board.setView_count(0);
        board.setStatus(1);
        board.setCreated_at(LocalDateTime.now());
        board.setUpdated_at(LocalDateTime.now());

        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            List<BoardImage> images = dto.getFiles().stream()
                    .map(f -> {
                        BoardImage img = new BoardImage();
                        img.setOriginal_name(f.getOriginalName()); // DTO 필드명에 맞게
                        img.setSaved_name(f.getSavedName());
                        img.setBoard(board); // 연관관계 주입 필수
                        return img;
                    })
                    .toList();
            board.setFiles(images);
        }

        Board saved = boardRepository.save(board);
        return BoardDTO.fromEntity(saved);
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
}
