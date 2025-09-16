package com.example.popic.vendor.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
public class OperatorController {

    @GetMapping({"/popups", "/popups/**"})
    public String operatorPopups() {
        return "forward:/index.html";
    }
}
