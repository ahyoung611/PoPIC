package com.example.popic.board.service;

import com.example.popic.board.dto.BoardDTO;
import com.example.popic.entity.entities.Board;
import com.example.popic.entity.entities.User;
import com.example.popic.board.repository.BoardRepository;
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

        Board board = new Board();
        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());
        board.setView_count(0);
        board.setStatus(1);
        board.setCreated_at(LocalDateTime.now());
        board.setUpdated_at(LocalDateTime.now());

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
