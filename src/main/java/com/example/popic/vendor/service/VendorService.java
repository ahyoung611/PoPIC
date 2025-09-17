package com.example.popic.vendor.service;

import com.example.popic.entity.entities.ROLE;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorService {
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountUserVendorService accountUserVendorService;

    public Long joinVendor(Vendor vendor) {
        accountUserVendorService.assertLoginIdAvailable(vendor.getLogin_id());
        accountUserVendorService.assertBrnAvailable(vendor.getBrn());

        vendor.setPassword(passwordEncoder.encode(vendor.getPassword()));
        vendor.setRole(ROLE.VENDOR);
        vendor.setStatus(2); // 승인대기

        return vendorRepository.save(vendor).getVendor_id();
    }
}
