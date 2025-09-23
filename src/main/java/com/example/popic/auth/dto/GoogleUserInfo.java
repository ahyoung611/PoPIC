package com.example.popic.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
    private String id;                // 구글 고유 ID
    private String email;             // 구글 이메일
    private Boolean emailVerified;    // 이메일 검증 여부
    private String name;              // 풀네임
    private String givenName;         // 성
    private String familyName;        // 이름
    private String picture;           // 프로필 이미지 URL
    private String locale;            // 언어

}
