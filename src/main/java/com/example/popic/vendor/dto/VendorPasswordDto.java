package com.example.popic.vendor.dto;

public record VendorPasswordDto(
        String currentPassword,
        String newPassword,
        String confirmNewPassword
) {}
