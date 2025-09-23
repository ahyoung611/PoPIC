package com.example.popic.auth.service;

import com.example.popic.auth.dto.GoogleUserInfo;
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
public class GoogleLoginService {
    private final RestTemplate restTemplate;

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.pw}")
    private String googleClientPw;

    @Value("${google.redirect-uri}") // 구글 콘솔 승인된 리디렉션 URI와 '정확히' 일치
    private String redirectUri;

    public GoogleUserInfo getUserInfo(String code) {
        // 1) code -> token
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientPw);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        Map<String, Object> tokenResponse = restTemplate.postForObject(
                "https://oauth2.googleapis.com/token",
                new HttpEntity<>(body, headers),
                Map.class
        );
        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new IllegalStateException("Google token exchange failed: " + tokenResponse);
        }
        String accessToken = (String) tokenResponse.get("access_token");

        // 2) token -> userinfo
        HttpHeaders h2 = new HttpHeaders();
        h2.setBearerAuth(accessToken);
        ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                "https://openidconnect.googleapis.com/v1/userinfo",
                HttpMethod.GET,
                new HttpEntity<>(h2),
                Map.class
        );
        if (!userInfoResponse.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Google userinfo fetch failed: " + userInfoResponse.getStatusCode());
        }
        Map<String, Object> m = userInfoResponse.getBody();
        if (m == null || m.get("sub") == null) {
            throw new IllegalStateException("Google userinfo missing sub");
        }

        String id         = (String) m.get("sub");
        String email      = (String) m.get("email");
        Boolean verified  = (m.get("email_verified") instanceof Boolean) ? (Boolean) m.get("email_verified") : null;
        String name       = (String) m.get("name");
        String givenName  = (String) m.get("given_name");
        String familyName = (String) m.get("family_name");
        String picture    = (String) m.get("picture");
        String locale     = (String) m.get("locale");

        return new GoogleUserInfo(
                id, email, verified, name, givenName, familyName, picture, locale
        );
    }
}
