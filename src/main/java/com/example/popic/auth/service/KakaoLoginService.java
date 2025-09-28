package com.example.popic.auth.service;

import com.example.popic.auth.dto.KakaoUserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoLoginService {
    private final RestTemplate restTemplate;

    @Value("${kakao.rest.key}")
    private String kakaoClientId;
    @Value("${kakao.rest.secret}")
    private String kakaoClientSecret;
    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    public KakaoUserInfo getUserInfo(String code, String state) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String,String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", kakaoClientId);
        body.add("redirect_uri", redirectUri);
        body.add("code", code);

        if (kakaoClientSecret != null && !kakaoClientSecret.isBlank()) {
            body.add("client_secret", kakaoClientSecret);
        }

        Map<String, Object> tokenRes = restTemplate.postForObject(
                "https://kauth.kakao.com/oauth/token",
                new HttpEntity<>(body, headers),
                Map.class
        );

        if (tokenRes == null || tokenRes.get("access_token") == null) {
            throw new IllegalStateException("Kakao token exchange failed: " + tokenRes);
        }

        String accessToken = (String) tokenRes.get("access_token");

        HttpHeaders h2 = new HttpHeaders();
        h2.setBearerAuth(accessToken);
        ResponseEntity<Map> userRes = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                new HttpEntity<>(h2),
                Map.class
        );

        if (!userRes.getStatusCode().is2xxSuccessful() || userRes.getBody() == null) {
            throw new IllegalStateException("Kakao userinfo fetch failed: " + userRes.getStatusCode());
        }

        Map<String, Object> root = userRes.getBody();
        Long id = ((Number) root.get("id")).longValue();

        String nickname = null;
        String profileImage = null;
        String email = null;

        Object acc = root.get("kakao_account");
        if (acc instanceof Map<?, ?> accMap) {
            // email
            Object emailObj = accMap.get("email");
            if (emailObj instanceof String e) {
                email = e;
            }
            // profile
            Object prof = accMap.get("profile");
            if (prof instanceof Map<?, ?> p) {
                nickname = (String) p.get("nickname");
                profileImage = (String) p.get("profile_image_url");
            }
        }
        if (nickname == null || profileImage == null) {
            Object props = root.get("properties");
            if (props instanceof Map<?, ?> pm) {
                if (nickname == null) nickname = (String) pm.get("nickname");
                if (profileImage == null) profileImage = (String) pm.get("profile_image");
            }
        }
        if (nickname == null) nickname = "카카오유저";

        System.out.println("서비스 끝");
        return new KakaoUserInfo(String.valueOf(id), nickname, profileImage, email);
    }
}
