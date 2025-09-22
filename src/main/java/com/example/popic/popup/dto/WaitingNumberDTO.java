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
    private Integer queueNumber;
    private int status;
    private LocalDateTime createdAt;
    private LocalDateTime callTime;


    public WaitingNumberDTO(Long id, Integer queueNumber, int status) {
        this.id = id;
        this.queueNumber = queueNumber;
        this.status = status;
    }

    public static WaitingNumberDTO fromEntity(WaitingNumber waitingNumber) {
        return new WaitingNumberDTO(
                waitingNumber.getId(),
                waitingNumber.getUser().getUser_id(),
                waitingNumber.getStore().getStore_id(),
                waitingNumber.getQueue_number(),
                waitingNumber.getStatus(),
                waitingNumber.getCreated_at(),
                waitingNumber.getCall_time()
        );
    }
}
