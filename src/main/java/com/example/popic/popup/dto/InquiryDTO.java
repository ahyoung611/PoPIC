package com.example.popic.popup.dto;

import com.example.popic.entity.entities.Inquiry;
import com.example.popic.entity.entities.User;
import com.example.popic.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InquiryDTO {
    private Long id;
    private UserDTO user;    // 사용자 번호
    private PopupDTO popup;   // 팝업스토어 번호
    private String subject; // 제목
    private String content; // 내용
    private Boolean isPrivate; // 비공개 여부
    private LocalDateTime created_at; // 문의 시간

    public InquiryDTO(Inquiry inquiry) {
        this.id = inquiry.getInquiry_id();
        this.user = new UserDTO(inquiry.getUser());
        this.popup = new PopupDTO(inquiry.getPopup_store());
        this.subject = inquiry.getTitle();
        this.content = inquiry.getContent();
        this.isPrivate = inquiry.getVisibility();
        this.created_at = inquiry.getCreated_at();
    }
}
