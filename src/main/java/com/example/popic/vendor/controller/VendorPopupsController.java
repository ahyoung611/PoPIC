package com.example.popic.vendor.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class VendorPopupsController {

    @GetMapping({"vendorPopups", "vendorPopups/**"})
    public String vendorPopups() {
        return "forward:/index.html";
    }



}
