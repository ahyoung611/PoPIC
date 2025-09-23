package com.example.popic.user.dto;

public record UserPasswordDto (
        String currentPassword,
        String newPassword,
        String confirmNewPassword
){}
