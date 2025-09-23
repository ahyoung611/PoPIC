package com.example.popic.vendor.controller;


import com.example.popic.entity.entities.Vendor;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorRepository;
import com.example.popic.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.popic.security.JwtUtil;

// 토큰용 import
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import java.time.Duration;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vendor")
@RequiredArgsConstructor
public class VendorController {
    private final VendorService vendorService;
    private final AccountUserVendorService accountUserVendorService;
    private final JwtUtil jwtUtil;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

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

    @PostMapping("/login")
    public ResponseEntity<ApiRes> login(@RequestBody Vendor req) {
        try {
            if (req.getLogin_id() == null || req.getPassword() == null) { // ★
                return ResponseEntity.ok(ApiRes.fail("요청 형식이 올바르지 않습니다."));
            }

            // 인증은 서비스에서
            Vendor v = accountUserVendorService.authenticateVendor(req.getLogin_id(), req.getPassword());

            // 응답 DTO (기존 생성자 사용 + 보강 + 민감정보 차단)
            VendorDTO dto = new VendorDTO(v);
            dto.setRole(v.getRole());
            dto.setStatus(v.getStatus());
            dto.setPassword(null);
//            dto.setProfile(null);

            String access  = jwtUtil.createAccessToken(v.getLogin_id(), String.valueOf(v.getRole()), v.getVendor_id());
            String refresh = jwtUtil.createRefreshToken(v.getLogin_id());

            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refresh)
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(14)).build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(ApiRes.okLogin("로그인 성공", access, dto));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiRes.fail("로그인 처리 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/reservationList")
    public ResponseEntity<List<PopupReservationDTO>> getReservationList(@RequestParam(name = "popupId")Long popupId,
                                                                        @RequestParam(name="sort", defaultValue = "")String sort) {

        List<PopupReservationDTO> reservationList = vendorService.getReservationList(popupId, sort);

        return ResponseEntity.ok(reservationList);
    }

    @PutMapping("/vendors/{id}")
    public ResponseEntity<ApiRes> updateVendor(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Vendor vendor = vendorRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("해당 벤더가 없습니다."));

            if(payload.containsKey("vendor_name")) vendor.setVendor_name((String) payload.get("vendor_name"));
            if(payload.containsKey("manager_name")) vendor.setManager_name((String) payload.get("manager_name"));
            if(payload.containsKey("phone_number")) vendor.setPhone_number((String) payload.get("phone_number"));
            if(payload.containsKey("brn")) vendor.setBrn((String) payload.get("brn"));
            if(payload.containsKey("password")) {
                String pw = (String) payload.get("password");
                if(pw != null && !pw.isEmpty()) vendor.setPassword(passwordEncoder.encode(pw));
            }

            vendorRepository.save(vendor);
            return ResponseEntity.ok(ApiRes.ok(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiRes.fail("수정 실패: " + e.getMessage()));
        }
    }

    public record ApiRes(boolean result, String message, Long id, String token, Object user) {
        public static ApiRes ok(Long id){ return new ApiRes(true, "가입 성공", id, null, null); }
        public static ApiRes okLogin(String m, String token, Object user){ return new ApiRes(true, m, null, token, user); }
        public static ApiRes fail(String m){ return new ApiRes(false, m, null, null, null); }
    }

}
