package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.dto.PopupScheduleDTO;
import com.example.popic.popup.repository.PopupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PopupService {
    private final PopupRepository popupRepository;

    public PopupStore findById(Long id) {
        return popupRepository.findById(id).orElse(null);
    }

    public PopupDTO findByIdWithImages(Long id) {
        PopupStore popupStore = popupRepository.findByIdWithImages(id).orElse(null);

        System.out.println(popupStore);
        return new PopupDTO(popupStore);
    }

    public List<PopupScheduleDTO> getScheduleById(Long id) {
       return popupRepository.getScheduleByStoreId(id).stream()
               .map(PopupScheduleDTO::new)
               .toList();
    }
}
