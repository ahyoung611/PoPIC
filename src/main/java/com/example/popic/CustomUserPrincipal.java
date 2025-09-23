package com.example.popic;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomUserPrincipal {
    private Long id;
    private String username;
    private String role;

}
