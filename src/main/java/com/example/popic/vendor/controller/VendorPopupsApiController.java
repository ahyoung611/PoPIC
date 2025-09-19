package com.example.popic.vendor.controller;

import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.vendor.service.VendorPopupsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vendorPopups")
@RequiredArgsConstructor
public class VendorPopupsApiController {

    private final VendorPopupsService service;

    @GetMapping
    public List<PopupDTO> list() {
        return service.listPopups();
    }

    // 카카오 주소
    @GetMapping("/addresses/cities")
    public List<String> cities() { return service.getCities(); }

    @GetMapping("/addresses")
    public List<String> districts(@RequestParam String city) { return service.getDistricts(city); }

    // 팝업 카테고리
    @GetMapping("/categories")
    public List<CategorySimple> categories() { return service.getCategories(); }
    public record CategorySimple(Long id, String name) {}

    // 팝업 이미지 파일 여러개
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiRes> create(
            @RequestPart("dto") PopupDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            Long id = service.createPopup(dto, files == null ? List.of() : files);
            return ResponseEntity.ok(ApiRes.ok(id));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        }
    }

    // 팝업 이미지 파일
    @GetMapping(value = "/images/{storeId}/{savedName}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<byte[]> serveImage(
            @PathVariable Long storeId,
            @PathVariable String savedName) {
        try {
            VendorPopupsService.FilePayload fp = service.loadImage(storeId, savedName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fp.contentType()))
                    .body(fp.bytes());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 특정 팝업에 이미지 추가 업로드
    @PostMapping(
            value = "/{storeId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )

    public ResponseEntity<List<Long>> addImages(
            @PathVariable Long storeId,
            @RequestParam("files") List<MultipartFile> files) {
        List<Long> ids = service.addImagesToStore(storeId, files);
        return ResponseEntity.ok(ids);
    }


    @GetMapping(value = "/images/{imageId}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<byte[]> serveImageById(@PathVariable Long imageId) {
        try {
            VendorPopupsService.FilePayload fp = service.loadImageById(imageId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fp.contentType()))
                    .body(fp.bytes());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 이미지 파일 삭제
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        service.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    public record ApiRes(boolean result, String message, Long id) {
        public static ApiRes ok(Long id){ return new ApiRes(true, "OK", id); }
        public static ApiRes fail(String m){ return new ApiRes(false, m, null); }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PopupDTO> findOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.findPopup(id));
    }

    @PutMapping(value="/{id}", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiRes> update(@PathVariable Long id, @RequestBody PopupDTO dto) {
        service.updatePopup(id, dto);
        return ResponseEntity.ok(ApiRes.ok(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletePopup(id);
        return ResponseEntity.noContent().build();
    }
}
