package com.example.popic.vendor.controller;


import com.example.popic.entity.entities.Vendor;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.dto.WaitingNumberDTO;
import com.example.popic.popup.service.WaitingNumberService;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorRepository;
import com.example.popic.vendor.service.VendorService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.popic.security.JwtUtil;

import java.time.Duration;
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
    private final WaitingNumberService  waitingNumberService;

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
    public ResponseEntity<ApiRes> login(@RequestBody Vendor req,
                                        @RequestParam(name = "keep", defaultValue = "false") boolean keep,
                                        HttpServletResponse response) {
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

            // 리프레시 쿠키 수동 생성
            StringBuilder cookieBuilder = new StringBuilder();
            cookieBuilder.append("refreshToken=").append(refresh).append("; ");
            cookieBuilder.append("Path=/; ");
            cookieBuilder.append("HttpOnly; ");
//            cookieBuilder.append("Secure; "); // HTTPS 필수
            cookieBuilder.append("SameSite=lax; "); // 크로스사이트 허용

            // 로그인 유지 설정
            if (keep) {
                cookieBuilder.append("Max-Age=").append(Duration.ofDays(14).getSeconds()).append("; ");
            }
            // 쿠키 문자열 생성
            String cookieHeader = cookieBuilder.toString();

            // 응답 헤더에 직접 설정
            response.setHeader("Set-Cookie", cookieHeader);
            return ResponseEntity.ok(ApiRes.okLogin("로그인 성공", access, dto));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.ok(ApiRes.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiRes.fail("로그인 처리 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/reservationList")
    public ResponseEntity<Page<PopupReservationDTO>> getReservationList(
            @RequestParam(name = "vendorId") Long vendorId,
            @RequestParam(name = "sort", defaultValue = "") String sort,
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page, // 1-based
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        // Spring Pageable은 0-based page index 사용
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PopupReservationDTO> reservationPage = vendorService.getReservationList(vendorId, sort, keyword, pageable);

        return ResponseEntity.ok(reservationPage);
    }

    @PutMapping("/waitingCall")
    public ResponseEntity<Void> waitingCall(@RequestParam(name = "id")Long id){
        waitingNumberService.waitingCall(id);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/waitingEntry")
    public ResponseEntity<Void> waitingEntry(@RequestParam(name = "id")Long id){
        waitingNumberService.waitingEntry(id);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/waitingCancel")
    public ResponseEntity<Void> waitingCancel(@RequestParam(name = "id")Long id){
        waitingNumberService.waitingCancel(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/fieldWaitingList")
    public ResponseEntity<Page<WaitingNumberDTO>> getWaitingList(
            @RequestParam(name = "vendorId") Long vendorId,
            @RequestParam(name = "sort", defaultValue = "") String sort,
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page, // 1-based
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        // Spring Pageable은 0-based page index 사용
        Pageable pageable = PageRequest.of(page - 1, size);

        // 서비스에서 페이지 단위로 데이터를 가져오도록 수정
        Page<WaitingNumberDTO> waitingPage = waitingNumberService.findByVendorId(vendorId, sort, keyword, pageable);

        return ResponseEntity.ok(waitingPage);
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
