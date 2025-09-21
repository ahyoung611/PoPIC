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

    public List<PopupDTO> getPopupStatus(String sort, String keyword){
        return switch (sort) {
            case "approved" -> popupRepository.findApprovedPopup(keyword).stream()
                    .map(PopupDTO::new).collect(Collectors.toList());
            case "rejected" -> popupRepository.findRejectedPopup(keyword).stream()
                    .map(PopupDTO::new).collect(Collectors.toList());
            default -> popupRepository.findPendingPopup(keyword).stream()
                    .map(PopupDTO::new).collect(Collectors.toList());
        };
    }

    public void updatePopupStatus(Long popupId, int statusCode) {
        popupRepository.updatePopupStatus(popupId, statusCode);
    }
}
