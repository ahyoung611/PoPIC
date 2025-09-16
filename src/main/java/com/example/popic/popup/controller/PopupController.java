package com.example.popic.popup.controller;

import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/popupStore")
@RequiredArgsConstructor
public class PopupController {
    private final PopupService popupService;

    @GetMapping("/popupDetail")
    private PopupDTO popupDetail(){
        System.out.println("[popupDetail]");
//        System.out.println("[popupId]: " + popupId);

//        return popupService.findById(popupId);
        return new PopupDTO();
    }


}
