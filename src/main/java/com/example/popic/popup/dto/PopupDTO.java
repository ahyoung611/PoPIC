package com.example.popic.popup.dto;

import com.example.popic.entity.entities.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopupDTO {
    private Long store_id;
    private String store_name;
    private String description;
    private Long vendor; // 운영자
    private List<Long> categories = new ArrayList<>();
    private LocalDate start_date;
    private LocalDate end_date;
    private List<Long> schedules;
    private String address; // 주소 FK
    private String address_detail; // 상세 주소
    private Double latitude;  // KakaoMap 좌표
    private Double longitude;
    private BigDecimal price;
    private List<Long> images = new ArrayList<>();
    private LocalDateTime join_date;
    private LocalDateTime update_date;
    private LocalDateTime delete_date;
    private int status = 2; //2: 승인 대기, 1: 운영 시작 전 (승인 완료), 2: 운영 중, -1: 운영 종료, 0: 정지


    public PopupDTO(PopupStore entity) {
        this.store_id = entity.getStore_id();
        this.store_name = entity.getStore_name();
        this.vendor = entity.getVendor().getVendor_id();
        this.description = entity.getDescription();
        this.start_date = entity.getStart_date();
        this.end_date = entity.getEnd_date();
        this.schedules = entity.getSchedules().stream().map(PopupStoreSchedule::getSchedule_id).collect(Collectors.toList());
        this.address = entity.getAddress().getCity().concat(" ").concat(entity.getAddress().getDistrict());
        this.address_detail = entity.getAddress_detail();
        this.latitude = entity.getLatitude();
        this.longitude = entity.getLongitude();
        this.price = entity.getPrice();
        this.images = entity.getImages()
                .stream()
                .map(Image::getImage_id)
                .collect(Collectors.toList());
        this.join_date = entity.getJoin_date();
        this.update_date = entity.getUpdate_date();
        this.delete_date = entity.getDelete_date();
        this.status = entity.getStatus();
    }
}
