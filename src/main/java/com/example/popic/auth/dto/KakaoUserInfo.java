package com.example.popic.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class KakaoUserInfo {
    private String id;
    private String nickname;
    private String profileImage;
    private String email;
}
