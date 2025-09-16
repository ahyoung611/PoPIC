package com.example.popic.board.controller;

import com.example.popic.board.dto.BoardDTO;
import com.example.popic.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

record PostCreateRequest(String title, String content) {}
record PostResponse(Long id, String title, String content) {}

@RestController
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping("/new")
    public ResponseEntity<BoardDTO> save(@RequestBody BoardDTO dto) {
        return ResponseEntity.ok(boardService.save(dto));
    }

    @GetMapping
    public ResponseEntity<List<BoardDTO>> boards() {
        return ResponseEntity.ok(boardService.boards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDTO> findByBoardId(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.findByBoardId(id));
    }

}
