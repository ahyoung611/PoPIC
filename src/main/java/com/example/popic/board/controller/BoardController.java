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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;

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
                    .url("/board/file/" + savedName)
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

    @PostMapping("/new")
    public ResponseEntity<BoardDTO> save(@RequestBody BoardDTO dto,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername(); // JWT 토큰에서 복원된 username
        BoardDTO saved = boardService.save(dto, username);
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
        boardService.increaseView(id);
        return ResponseEntity.ok(boardService.findByBoardId(id));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<BoardDTO> update(@PathVariable Long id,
                                           @RequestBody BoardDTO dto,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        Board board = boardService.findEntityById(id);

        // 권한 체크는 login_id 기준
        if (!board.getUser().getLogin_id().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        BoardDTO updated = boardService.update(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        Board board = boardService.findEntityById(id);

        if (!board.getUser().getLogin_id().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boardService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
