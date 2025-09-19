package com.example.popic.auth.service;

import com.example.popic.auth.dto.NaverUserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NaverLoginService {
//    @Value("${naver.client.id}")
//    private String clientId;
//    @Value("${naver.client.secret}")
//    private String clientSecret;
//    @Value("${naver.redirect.uri}")
//    private String redirectUri;

//    private final RestTemplate restTemplate = new RestTemplate();

    public NaverUserInfo getUserInfo(String code, String state) {
        // 1. Access Token 요청
//        String tokenUrl = String.format(
//                "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=%s&client_secret=%s&code=%s&state=%s",
//                clientId, clientSecret, code, state
//        );
//
//        Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
//        String accessToken = (String) tokenResponse.get("access_token");
//
//        // 2. 사용자 정보 요청
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Authorization", "Bearer " + accessToken);
//
//        HttpEntity<Void> entity = new HttpEntity<>(headers);
//        ResponseEntity<Map> userInfoResponse =
//                restTemplate.exchange("https://openapi.naver.com/v1/nid/me", HttpMethod.GET, entity, Map.class);
//
//        Map<String, Object> response = (Map<String, Object>) userInfoResponse.getBody().get("response");
//
//        System.out.println(response.get("access_token"));
//
//        return new NaverUserInfo(
//                (String) response.get("id"),             // 네이버 고유 ID
//                (String) response.get("nickname"),       // 닉네임
//                (String) response.get("profile_image"),  // 프로필 이미지
//                (String) response.get("age"),            // 나이대
//                (String) response.get("gender"),         // 성별
//                (String) response.get("email"),          // 이메일
//                (String) response.get("name"),           // 실명
//                (String) response.get("birthday"),       // 생일 (MM-dd)
//                (String) response.get("birthyear"),      // 출생년도
//                (String) response.get("mobile")
//        );
        return null;
    }

}
