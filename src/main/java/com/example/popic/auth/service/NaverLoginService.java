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
    private final RestTemplate restTemplate;

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    public NaverUserInfo getUserInfo(String code, String state) {
        // 1. Access Token 요청
        String tokenUrl = String.format(
                "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=%s&client_secret=%s&code=%s&state=%s",
                clientId, clientSecret, code, state
        );

        Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
        String accessToken = (String) tokenResponse.get("access_token");

        // 2. 사용자 정보 요청
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> userInfoResponse =
                restTemplate.exchange("https://openapi.naver.com/v1/nid/me", HttpMethod.GET, entity, Map.class);

        Map<String, Object> response = (Map<String, Object>) userInfoResponse.getBody().get("response");

        for(String key : response.keySet()) {
            System.out.println(key + ": " + response.get(key));
            System.out.println("value" +  response.get(key));
        }

        return new NaverUserInfo(
                (String) response.get("id"),
                (String) response.get("nickname"),
                (String) response.get("profile_image"),
                (String) response.get("age"),
                (String) response.get("gender"),
                (String) response.get("email"),
                (String) response.get("name"),
                (String) response.get("birthday"),
                (String) response.get("birthyear"),
                (String) response.get("mobile")
        );
    }
}
