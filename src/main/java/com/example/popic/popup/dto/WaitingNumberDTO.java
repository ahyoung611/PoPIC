package com.example.popic.popup.dto;

import com.example.popic.entity.entities.WaitingNumber;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaitingNumberDTO {
    private Long id;
    private Long userId;
    private Long storeId;
    private String storeName;
    private String address;
    private String addressDetail;
    private LocalDate waitingDate;
    private Integer queueNumber;
    private int status;
    private LocalDateTime createdAt;
    private LocalDateTime callTime;
    private PopupDTO popup;

    public static WaitingNumberDTO fromEntity(WaitingNumber w) {
        var dto = new WaitingNumberDTO();
        dto.setId(w.getId());
        dto.setUserId(w.getUser().getUser_id());
        dto.setStoreId(w.getStore().getStore_id());
        dto.setStoreName(w.getStore().getStore_name());
        dto.setAddress(w.getStore().getAddress().getCity() + " " + w.getStore().getAddress().getDistrict());
        dto.setAddressDetail(w.getStore().getAddress_detail());
        dto.setWaitingDate(w.getWaitingDate());
        dto.setQueueNumber(w.getQueueNumber());
        dto.setStatus(w.getStatus());
        dto.setCreatedAt(w.getCreatedAt());
        dto.setCallTime(w.getCallTime());
        dto.setPopup(new PopupDTO(w.getStore()));
        return dto;
    }
}
