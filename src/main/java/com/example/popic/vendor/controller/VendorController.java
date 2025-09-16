package com.example.popic.vendor.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
public class VendorController {

    @GetMapping({"/popups", "/popups/**"})
    public String vendorPopups() {
        return "forward:/index.html";
    }
}
