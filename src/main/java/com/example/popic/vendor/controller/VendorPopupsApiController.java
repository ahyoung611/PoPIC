// com/example/popic/vendor/controller/VendorPopupsApiController.java
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

    @GetMapping("/addresses/cities")
    public List<String> cities() { return service.getCities(); }

    @GetMapping("/addresses")
    public List<String> districts(@RequestParam String city) { return service.getDistricts(city); }

    @GetMapping("/categories")
    public List<CategorySimple> categories() { return service.getCategories(); }
    public record CategorySimple(Long id, String name) {}

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

    public record ApiRes(boolean result, String message, Long id) {
        public static ApiRes ok(Long id){ return new ApiRes(true, "OK", id); }
        public static ApiRes fail(String m){ return new ApiRes(false, m, null); }
    }
}
