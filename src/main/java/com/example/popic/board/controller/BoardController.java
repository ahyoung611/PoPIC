package com.example.popic.board.controller;

import com.example.popic.board.dto.BoardDTO;
import com.example.popic.board.dto.BoardImageDTO;
import com.example.popic.board.service.BoardFileService;
import com.example.popic.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;

record PostCreateRequest(String title, String content) {
}

record PostResponse(Long id, String title, String content) {
}

@RestController
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final BoardFileService boardFileService;

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<List<BoardImageDTO>> upload(
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {

        if (files == null || files.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<BoardImageDTO> uploaded = files.stream().map(file -> {
            String savedName = boardFileService.store(file);
            return BoardImageDTO.builder()
                    .originalName(file.getOriginalFilename())
                    .savedName(savedName)
                    .build();
        }).toList();

        return ResponseEntity.ok(uploaded);
    }

    @PostMapping(value = "/deleteFile", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> deleteFile(@RequestBody Map<String, String> body) throws IOException {
        String fileName = body.get("fileName");
        boardFileService.delete(fileName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/new", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BoardDTO> save(@RequestBody BoardDTO dto) {
        if (dto.getFiles() == null) dto.setFiles(Collections.emptyList());
        BoardDTO saved = boardService.save(dto);
        return ResponseEntity.created(URI.create("/board/" + saved.getBoardId())).body(saved);
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
