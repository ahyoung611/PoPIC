package com.example.popic.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.OutputStream;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class QrCodeController {
    private final StringRedisTemplate redisTemplate;

    @GetMapping(value = "/generate-qr", produces = "image/png")
    public void generateQr(HttpServletResponse response) throws Exception {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        System.out.println(authentication);
        System.out.println(userName);

        // 1. 임시 토큰 생성
        String token = UUID.randomUUID().toString();
        String dummyReservationData = "userId:1234,popupId:5678"; // 실제 데이터

        redisTemplate.opsForValue().set(token, dummyReservationData, Duration.ofMinutes(1));

        // 2. QR 코드 URL
        String qrData = "http://10.5.4.14:8080/scan-qr?token=" + token;

        // 3. QR 코드 생성
        int width = 250;
        int height = 250;
        BitMatrix matrix = new MultiFormatWriter().encode(qrData, BarcodeFormat.QR_CODE, width, height);

        // 4. 이미지 응답
        response.setContentType("image/png");
        try (OutputStream out = response.getOutputStream()) {
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            out.flush();
        }
    }

    @GetMapping("/scan-qr")
    public Map<String, Object> scanQr(@RequestParam("token") String token) {
        Map<String, Object> response = new HashMap<>();

        // 1. Redis에서 토큰 조회
        String reservationData = redisTemplate.opsForValue().get(token);

        System.out.println("reservation: " + reservationData);

        if (reservationData == null) {
            response.put("success", false);
            response.put("message", "QR 코드가 만료되었거나 유효하지 않습니다.");
        } else {
            // 2. 토큰이 유효하면 예약 정보 반환
            response.put("success", true);
            response.put("data", reservationData);

            // 3. 토큰 즉시 삭제 (1회용)
            redisTemplate.delete(token);
        }
        return response;
    }

}
