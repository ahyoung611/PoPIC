package com.example.popic.popup.dto;

import com.example.popic.entity.entities.WaitingNumber;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer queueNumber;
    private int status;
    private LocalDateTime createdAt;
    private LocalDateTime callTime;
    private PopupDTO popup;

    public WaitingNumberDTO(Long id, Long userId, Long storeId, String storeName, String address, String addressDetail, Integer queueNumber, int status, LocalDateTime createdAt, LocalDateTime callTime) {
        this.id = id;
        this.userId = userId;
        this.storeId = storeId;
        this.storeName = storeName;
        this.address = address;
        this.addressDetail = addressDetail;
        this.queueNumber = queueNumber;
        this.status = status;
        this.createdAt = createdAt;
        this.callTime = callTime;
    }

    public static WaitingNumberDTO fromEntity(WaitingNumber w) {
        var dto = new WaitingNumberDTO(
                w.getId(),
                w.getUser().getUser_id(),
                w.getStore().getStore_id(),
                w.getStore().getStore_name(),
                w.getStore().getAddress().getCity() + " " + w.getStore().getAddress().getDistrict(),
                w.getStore().getAddress_detail(),
                w.getQueue_number(),
                w.getStatus(),
                w.getCreated_at(),
                w.getCall_time()
        );
        dto.setPopup(new PopupDTO(w.getStore()));
        return dto;
    }
}
