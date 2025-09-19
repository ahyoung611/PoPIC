package com.example.popic.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NaverUserInfo {
    private String id;             // 네이버 고유 ID
    private String nickname;       // 닉네임
    private String profileImage;   // 프로필 이미지 URL
    private String age;            // 나이대
    private String gender;         // 성별 (M/F)
    private String email;          // 이메일
    private String name;           // 실명
    private String birthday;       // 생일 (MM-dd)
    private String birthyear;      // 출생년도
    private String mobile;         // 전화번호

}
