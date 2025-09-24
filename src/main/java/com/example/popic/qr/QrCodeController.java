package com.example.popic.qr;

import com.example.popic.CustomUserPrincipal;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class QrCodeController {
    private final StringRedisTemplate redisTemplate;
    private final ReservationService reservationService;

    @GetMapping(value = "/generate-qr", produces = "application/json")
    public ResponseEntity<Map<String, Object>> generateQr(HttpServletResponse response, @RequestParam(name="reservationId")Long reservationId) throws Exception {
        // 입장권 확인
        PopupReservationDTO reservationDTO = reservationService.findbyId(reservationId);

        Map<String, Object> res = new HashMap<>();

        res.put("reservation", reservationDTO);

        int width = 250;
        int height = 250;

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.black);
        g.fillRect(0, 0, width, height);

        if(reservationDTO.getStatus() != 1){
            res.put("status", "USED");
        }else{
            res.put("status", "OK");
        }

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String json = objectMapper.writeValueAsString(reservationDTO);


        // 1. 임시 토큰 생성
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(token, json, Duration.ofMinutes(5));

        // 2. QR 코드 URL
        String qrData = "http://10.5.4.14:8080/scan-qr?token=" + token;
        // 3. QR 코드 생성
        BitMatrix matrix = new MultiFormatWriter().encode(qrData, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());

        res.put("qrImage", "data:image/png;base64," + base64Image);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/scan-qr")
    public Map<String, Object> scanQr(@RequestParam("token") String token) {
        Map<String, Object> response = new HashMap<>();

//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        CustomUserPrincipal principal =  (CustomUserPrincipal) authentication.getPrincipal();

//        if(!principal.getRole().equals("VENDOR")){}

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
