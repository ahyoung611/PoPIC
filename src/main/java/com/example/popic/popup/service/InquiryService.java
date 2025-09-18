package com.example.popic.popup.service;

import com.example.popic.entity.entities.Inquiry;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.User;
import com.example.popic.popup.dto.InquiryDTO;
import com.example.popic.popup.repository.InquiryRepository;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.swing.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final PopupRepository  popupRepository;

    public void save(InquiryDTO inquiryRequestDTO) {
        User user = userRepository.findById(inquiryRequestDTO.getUser().getUser_id()).orElse(null);
        PopupStore store =  popupRepository.findById(inquiryRequestDTO.getPopup().getStore_id()).orElse(null);

        Inquiry inquiry = Inquiry.builder()
                .title(inquiryRequestDTO.getSubject())
                .content(inquiryRequestDTO.getContent())
                .visibility(inquiryRequestDTO.getIsPrivate())
                .user(user)
                .popup_store(store)
                .build();
        inquiryRepository.save(inquiry);
    }

    public List<InquiryDTO> findAllByPopupId(Long popupId) {
        return inquiryRepository.findAllByPopupId(popupId).stream()
                .map(InquiryDTO::new)
                .collect(Collectors.toList());
    }
}
