package com.example.popic.vendor.controller;


import com.example.popic.entity.entities.Vendor;
import com.example.popic.vendor.repository.VendorRepository;
import com.example.popic.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendor")
@RequiredArgsConstructor
public class VendorController {
    private final VendorService vendorService;
    private final VendorRepository vendorRepository;

    @PostMapping("/join")
    public ResponseEntity<ApiRes> join(@RequestBody Vendor vendor) {
        try {
            Long id = vendorService.joinVendor(vendor);
            return ResponseEntity.ok(ApiRes.ok(id));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.ok(ApiRes.fail("이미 사용 중인 아이디 또는 사업자등록번호입니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiRes.fail("가입 처리 중 오류가 발생했습니다."));
        }
    }

    public record ApiRes(boolean result, String message, Long id) {
        public static ApiRes ok(Long id){ return new ApiRes(true, "가입 성공", id); }
        public static ApiRes fail(String m){ return new ApiRes(false, m, null); }
    }


}
