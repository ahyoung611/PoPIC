package com.example.popic.popup.service;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.ReviewReply;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.dto.PopupReviewDTO;
import com.example.popic.popup.dto.PopupScheduleDTO;
import com.example.popic.popup.dto.ReviewReplyDTO;
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

        return new PopupDTO(popupStore);
    }

    public List<PopupScheduleDTO> getScheduleById(Long id) {
       return popupRepository.getScheduleByStoreId(id).stream()
               .map(PopupScheduleDTO::new)
               .toList();
    }

    public List<PopupReviewDTO> getReviewByIdAndKeyword(Long id, String keyword) {
        System.out.println("keyword: " + keyword);
        return popupRepository.getReviewByStoreIdAndKeyword(id, keyword).stream()
                .map(PopupReviewDTO::new)
                .toList();
    }

    public List<ReviewReplyDTO> getReviewReply(Long id) {
        List<ReviewReply> reviewReplies = popupRepository.getReviewReply(id);
        return  reviewReplies.stream()
                .map(ReviewReplyDTO::new)
                .toList();
    }
}
