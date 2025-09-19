package com.example.popic.admin.service;

import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final PopupRepository popupRepository;

    public List<PopupDTO> findPendingPopup(){
        return popupRepository.findPendingPopup().stream()
                .map(PopupDTO::new)
                .collect(Collectors.toList());
    }
}
