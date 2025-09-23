package com.example.popic.auth.dto;

import com.example.popic.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private boolean result;
    private String message;
    private String accessToken;
    private UserDTO user;

    public LoginResponse(boolean result, String message) {
        this.result = result;
        this.message = message;
    }
}
