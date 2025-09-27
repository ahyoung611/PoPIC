package com.example.popic.popup.dto;

import com.example.popic.entity.entities.*;
import com.example.popic.image.dto.ImageDTO;
import com.example.popic.vendor.dto.VendorDTO;
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
    private VendorDTO vendor; // 운영자
    private List<Long> categories = new ArrayList<>(); // 전송용
    private List<String> category_names = new ArrayList<>(); // young 화면 표시용
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

    // young 팝업운영자 스토어 썸네일/삭제 상세목록
    private List<ImageDTO> images_detail = new ArrayList<>();

    // young
    private String thumb; // 팝업운영자 팝업 카드에서 쓸 이미지
    private List<String> open_days;        // ["MONDAY","WEDNESDAY", ...]  (엔티티 enum 이름과 동일)
    private String open_start_time;        // "10:00"
    private String open_end_time;          // "19:00"
    private Integer slot_minutes = 60;     // 슬롯 분단위(기본 60분)
    private Integer capacity_per_hour;     // 시간당 정원

    public PopupDTO(PopupStore entity) {
        this.store_id = entity.getStore_id();
        this.store_name = entity.getStore_name();
        this.vendor = new VendorDTO(entity.getVendor());
        this.description = entity.getDescription();
        this.start_date = entity.getStart_date();
        this.end_date = entity.getEnd_date();
        this.schedules = entity.getSchedules() == null ? new ArrayList<>()
                : entity.getSchedules().stream()
                .map(PopupStoreSchedule::getSchedule_id)
                .collect(Collectors.toList());
        this.address = (entity.getAddress() != null) ?
                entity.getAddress().getCity().concat(" ").concat(entity.getAddress().getDistrict()) : null;
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

        // young categories에 대한 null 체크
        if (entity.getCategories() != null) {
            this.categories = entity.getCategories()
                    .stream()
                    .map(Category::getCategory_id)
                    .collect(Collectors.toList());
            this.category_names = entity.getCategories()
                    .stream()
                    .map(Category::getName)
                    .collect(Collectors.toList());
        } else {
            this.categories = new ArrayList<>();
            this.category_names = new ArrayList<>();
        }

        // young 첫 번째 이미지가 있으면 URL로 생성
        if (entity.getImages() != null && !entity.getImages().isEmpty()) {
            Image firstImage = entity.getImages().get(0);

            // 썸네일 경로 설정
            this.thumb = "/api/vendors/" + entity.getVendor().getVendor_id() + "/popups/images/"
                    + entity.getStore_id() + "/" + firstImage.getSaved_name();

            // images_detail 초기화 (ImageDTO 사용)
            this.images_detail = entity.getImages().stream()
                    .map(ImageDTO::new) // ImageDTO(Image entity) 생성자 사용
                    .collect(Collectors.toList());

            // images 필드 초기화 (ID만)
            this.images = entity.getImages().stream()
                    .map(Image::getImage_id)
                    .collect(Collectors.toList());
        } else {
            this.thumb = null;
            this.images_detail = new ArrayList<>();
            this.images = new ArrayList<>();
        }

        // young 스케줄 요일/운영시간
        if (entity.getSchedules() != null && !entity.getSchedules().isEmpty()) {
            this.open_days = entity.getSchedules().stream()
                    .map(s -> s.getDayOfWeek().name())
                    .distinct()
                    .collect(Collectors.toList());

            var minStart = entity.getSchedules().stream()
                    .map(PopupStoreSchedule::getStart_time)
                    .filter(java.util.Objects::nonNull)
                    .min(java.time.LocalTime::compareTo).orElse(null);
            var maxEnd = entity.getSchedules().stream()
                    .map(PopupStoreSchedule::getEnd_time)
                    .filter(java.util.Objects::nonNull)
                    .max(java.time.LocalTime::compareTo).orElse(null);

            if (minStart != null) this.open_start_time = minStart.toString().substring(0, 5);
            if (maxEnd != null) this.open_end_time = maxEnd.toString().substring(0, 5);
        } else {
            this.open_days = new ArrayList<>();
            this.open_start_time = null;
            this.open_end_time = null;
        }
    }


}


