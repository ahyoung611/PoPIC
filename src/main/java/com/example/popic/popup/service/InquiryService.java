package com.example.popic.popup.service;

import com.example.popic.entity.entities.*;
import com.example.popic.popup.dto.InquiryDTO;
import com.example.popic.popup.dto.InquiryRepliyDTO;
import com.example.popic.popup.repository.InquiryReplyRepository;
import com.example.popic.popup.repository.InquiryRepository;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorRepository;
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
    private final InquiryReplyRepository  inquiryReplyRepository;
    private final VendorRepository vendorRepository;


    public void save(InquiryDTO inquiryRequestDTO) {
        User user = userRepository.findById(inquiryRequestDTO.getUserId()).orElse(null);
        PopupStore store =  popupRepository.findById(inquiryRequestDTO.getPopupId()).orElse(null);

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

    public List<InquiryRepliyDTO> getAllReply(Long popupId) {
        return inquiryReplyRepository.getAllRepliy(popupId).stream()
                .map(InquiryRepliyDTO::new)
                .collect(Collectors.toList());
    }

    public void saveReply(InquiryRepliyDTO reply) {
        PopupStore store = popupRepository.findById(reply.getPopup_id()).orElse(null);
        Vendor vendor = vendorRepository.findById(reply.getVendor().getVendor_id()).orElse(null);
        Inquiry inquiry = inquiryRepository.findById(reply.getInquiry_id()).orElse(null);


        InquiryReply inquiryReply = InquiryReply.builder()
                .inquiry(inquiry)
                .content(reply.getContent())
                .popup_store(store)
                .vendor(vendor)
                .build();

        inquiryReplyRepository.save(inquiryReply);
    }

}
