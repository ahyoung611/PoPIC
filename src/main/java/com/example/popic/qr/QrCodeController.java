package com.example.popic.qr;

import com.example.popic.CustomUserPrincipal;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.service.ReservationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;

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
        res.put("status", reservationDTO.getStatus() == 1 ? "OK" : "USED");

        // 직렬화
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String json = objectMapper.writeValueAsString(reservationDTO);

        // 임시 토큰 생성
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(token, json, Duration.ofMinutes(5));

        // QR 생성
        int width = 250;
        int height = 250;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.black);
        g.fillRect(0, 0, width, height);
        String qrData = "http://10.5.4.14:8080/scan-qr?token=" + token;
        BitMatrix matrix = new MultiFormatWriter().encode(qrData, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());

        res.put("token", token);
        res.put("qrImage", "data:image/png;base64," + base64Image);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/scan-qr")
    public Map<String, Object> scanQr(@RequestParam("token") String token) throws JsonProcessingException {
        Map<String, Object> response = new HashMap<>();

        String reservationData = redisTemplate.opsForValue().get(token);

        if (reservationData == null) {
            response.put("success", false);
            response.put("message", "QR 코드가 만료되었거나 유효하지 않습니다.");
            return response;
        }

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        PopupReservationDTO reservationDTO = objectMapper.readValue(reservationData, PopupReservationDTO.class);
        System.out.println("reservationDTO: " + reservationDTO);

        if(reservationDTO.getStatus() != 1){
            throw new RuntimeException("유효하지 않은 티켓입니다.");
        }
        reservationService.entryReservationById(reservationDTO.getReservationId());

        response.put("success", true);
        response.put("data", reservationData);

        redisTemplate.delete(token);

        return response;
    }

    // ----------------- SSE 실시간 상태 -----------------
    @GetMapping(value = "/qr-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamQrStatus(@RequestParam String token) {
        SseEmitter emitter = new SseEmitter(0L); // 타임아웃 없음
        ObjectMapper objectMapper = new ObjectMapper();

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                String lastStatusStr = null;

                while (true) {
                    String reservationData = redisTemplate.opsForValue().get(token);
                    String statusStr;

                    if (reservationData == null) {
                        statusStr = "USED"; // 이미 스캔됨
                    } else {
                        // JSON 파싱
                        JsonNode rootNode = objectMapper.readTree(reservationData);
                        int status = rootNode.path("status").asInt();

                        switch (status) {
                            case 0:
                                statusStr = "USED";
                                break;
                            case 1:
                                statusStr = "OK";
                                break;
                            case -1:
                                statusStr = "CANCELED";
                                break;
                            default:
                                statusStr = "UNKNOWN";
                        }
                    }

                    // 상태가 변했을 때만 전송
                    if (!statusStr.equals(lastStatusStr)) {
                        emitter.send(statusStr);
                        lastStatusStr = statusStr;
                    }

                    // 이미 사용됐거나 취소됐으면 종료
                    if ("USED".equals(statusStr) || "CANCELED".equals(statusStr)) {
                        break;
                    }

                    Thread.sleep(2000); // 2초마다 상태 체크
                }

                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

}
