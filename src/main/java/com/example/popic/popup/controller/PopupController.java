package com.example.popic.popup.controller;

import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.dto.PopupScheduleDTO;
import com.example.popic.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/popupStore")
@RequiredArgsConstructor
public class PopupController {
    private final PopupService popupService;

    @GetMapping("/popupDetail")
    private ResponseEntity<PopupDTO> popupDetail(@RequestParam(name="id") Long id){
        PopupDTO popupDTO = popupService.findByIdWithImages(id);
        return ResponseEntity.ok(popupDTO);
    }

    @GetMapping("/popupSchedule")
    private ResponseEntity<List<PopupScheduleDTO>> getSchedule(@RequestParam(name = "popupId") Long id){
        List<PopupScheduleDTO> scheduleList = popupService.getScheduleById(id);
        return ResponseEntity.ok(scheduleList);
    }
}
