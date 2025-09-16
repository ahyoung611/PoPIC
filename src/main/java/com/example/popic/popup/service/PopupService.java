package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.repository.PopupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class PopupService {
    private final PopupRepository popupRepository;

    public PopupDTO findById(Long popupId) {
        PopupStore popup = popupRepository.findById(popupId).orElse(null);

        return new PopupDTO(popup);
    }
}
