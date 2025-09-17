package com.example.popic.board.controller;

import com.example.popic.board.dto.BoardDTO;
import com.example.popic.board.dto.BoardImageDTO;
import com.example.popic.board.service.BoardFileService;
import com.example.popic.board.service.BoardService;
import com.example.popic.entity.entities.Board;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
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

    @GetMapping("/file/{savedName}")
    public ResponseEntity<byte[]> serveFile(@PathVariable String savedName) {
        try {
            BoardFileService.FilePayload fp = boardFileService.load(savedName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fp.contentType()))
                    .body(fp.bytes());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
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
    public Page<BoardDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "tc") String scope // tc=제목+내용 | title | content
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "created_at"));
        Page<Board> result = boardService.search(keyword, pageable, scope);
        return result.map(BoardDTO::fromEntity);
    }

    @GetMapping(value = "/{id:\\d+}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BoardDTO> findByBoardId(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.findByBoardId(id));
    }

    @PutMapping(value = "/{id:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BoardDTO> update(@PathVariable Long id, @RequestBody BoardDTO dto) {
        BoardDTO updated = boardService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boardService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
