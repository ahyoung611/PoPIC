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
@RequestMapping("/api/vendors/{vendorId}/popups")
@RequiredArgsConstructor
public class VendorPopupsController {

    private final VendorPopupsService service;

    // 해당 벤더 목록 조회
    @GetMapping
    public List<PopupDTO> list(@PathVariable Long vendorId) {
        return service.listPopupsByVendor(vendorId);
    }

    // 카카오 주소(시)
    @GetMapping("/addresses/cities")
    public List<String> cities() { return service.getCities(); }

    // 카카오 주소(구)
    @GetMapping("/addresses")
    public List<String> districts(@RequestParam String city) { return service.getDistricts(city); }

    // 카테고리 목록
    @GetMapping("/categories")
    public List<CategorySimple> categories() { return service.getCategories(); }
    public record CategorySimple(Long id, String name) {}

    // 팝업 생성(소유자 = vendorId)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiRes> create(@PathVariable Long vendorId,
                                         @RequestPart("dto") PopupDTO dto,
                                         @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            Long id = service.createPopupForVendor(vendorId, dto, files == null ? List.of() : files);
            return ResponseEntity.ok(ApiRes.ok(id));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        }
    }

    // 이미지 파일 서빙(storeId/savedName)
    @GetMapping(value = "/images/{storeId}/{savedName}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<byte[]> serveImage(@PathVariable Long vendorId, // 경로 일치용
                                             @PathVariable Long storeId,
                                             @PathVariable String savedName) {
        try {
            var fp = service.loadImage(storeId, savedName);
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(fp.contentType())).body(fp.bytes());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 특정 팝업 이미지 추가 업로드
    @PostMapping(value = "/{storeId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Long>> addImages(@PathVariable Long vendorId,
                                                @PathVariable Long storeId,
                                                @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(service.addImagesToStoreOwnedBy(vendorId, storeId, files));
    }

    // 이미지 id로 서빙
    @GetMapping(value = "/images/{imageId}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<byte[]> serveImageById(@PathVariable Long vendorId,
                                                 @PathVariable Long imageId) {
        try {
            var fp = service.loadImageById(imageId);
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(fp.contentType())).body(fp.bytes());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 이미지 삭제
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long vendorId,
                                            @PathVariable Long imageId) {
        service.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    public record ApiRes(boolean result, String message, Long id) {
        public static ApiRes ok(Long id){ return new ApiRes(true, "OK", id); }
        public static ApiRes fail(String m){ return new ApiRes(false, m, null); }
    }

    // 팝업 조회
    @GetMapping("/{id}")
    public ResponseEntity<PopupDTO> findOne(@PathVariable Long vendorId, @PathVariable Long id) {
        return ResponseEntity.ok(service.findPopupOwnedBy(vendorId, id));
    }

    // 팝업 수정
    @PutMapping(value="/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiRes> update(@PathVariable Long vendorId, @PathVariable Long id, @RequestBody PopupDTO dto) {
        service.updatePopupOwnedBy(vendorId, id, dto);
        return ResponseEntity.ok(ApiRes.ok(id));
    }

    // 팝업 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long vendorId, @PathVariable Long id) {
        service.deletePopupOwnedBy(vendorId, id);
        return ResponseEntity.noContent().build();
    }
}