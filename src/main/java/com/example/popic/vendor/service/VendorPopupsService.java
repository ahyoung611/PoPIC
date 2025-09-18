package com.example.popic.vendor.service;

import com.example.popic.entity.entities.Address;
import com.example.popic.entity.entities.Image;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.vendor.controller.VendorPopupsApiController;
import com.example.popic.vendor.repository.VendorPopupsRepository;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.example.popic.entity.entities.DayOfWeek;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.PopupStoreSlot;
import java.time.LocalDate;

import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorPopupsService {

    private final VendorPopupsRepository repository;
    private final VendorRepository vendorRepository;

    @Transactional(readOnly = true)
    public List<PopupDTO> listPopups() {
        return repository.findAllStores()
                .stream()
                .map(PopupDTO::new)
                .toList();
    }

    @Value("${uploadPath:C:/upload/}")
    private String uploadPath;

    @Value("${app.defaultVendorLoginId:vendor1}")
    private String defaultVendorLoginId;

    public List<String> getCities() { return repository.findDistinctCities(); }

    public List<String> getDistricts(String city) { return repository.findDistrictsByCity(city); }

    public List<VendorPopupsApiController.CategorySimple> getCategories() {
        return repository.findAllCategories().stream()
                .map(r -> new VendorPopupsApiController.CategorySimple(r.id(), r.name()))
                .toList();
    }

    /** 팝업 생성 + 파일 저장 + 스케줄/슬롯 생성 */
    @Transactional
    public Long createPopup(PopupDTO dto, List<MultipartFile> files) {
        // 1) 기본 검증
        if (!StringUtils.hasText(dto.getStore_name())) throw new IllegalArgumentException("store_name 누락");
        if (dto.getStart_date() == null || dto.getEnd_date() == null) throw new IllegalArgumentException("운영 기간 누락");
        if (!StringUtils.hasText(dto.getAddress()) || !StringUtils.hasText(dto.getAddress_detail()))
            throw new IllegalArgumentException("주소(시/구 + 상세) 누락");

        // 2) 주소 FK
        String[] parts = dto.getAddress().trim().split("\\s+");
        if (parts.length < 2) throw new IllegalArgumentException("주소 형식 오류: \"시 구\" 필요");
        String city = parts[0], district = parts[1];
        Address address = repository.findAddressByCityDistrict(city, district)
                .orElseThrow(() -> new IllegalArgumentException("주소를 찾을 수 없습니다: " + dto.getAddress()));

        // 3) 운영자
        Vendor vendor;
        if (dto.getVendor() == null) {
            vendor = vendorRepository.findByLoginId(defaultVendorLoginId)
                    .orElseThrow(() -> new IllegalStateException("기본 운영자(" + defaultVendorLoginId + ")가 없습니다."));
        } else {
            vendor = vendorRepository.findById(dto.getVendor())
                    .orElseThrow(() -> new IllegalArgumentException("vendor가 존재하지 않습니다. id=" + dto.getVendor()));
        }

        // 4) 팝업 기본 정보 저장
        PopupStore store = new PopupStore();
        store.setStore_name(dto.getStore_name());
        store.setDescription(dto.getDescription());
        store.setStart_date(dto.getStart_date());
        store.setEnd_date(dto.getEnd_date());
        store.setAddress(address);
        store.setAddress_detail(dto.getAddress_detail());
        store.setLatitude(dto.getLatitude());
        store.setLongitude(dto.getLongitude());
        store.setPrice(dto.getPrice());
        store.setStatus(dto.getStatus()); // 프론트 기본 2(승인 대기)
        store.setVendor(vendor);
        store.setJoin_date(LocalDateTime.now());

        // 카테고리 연결(선택 시)
        if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
            store.setCategories(repository.findCategoriesByIds(dto.getCategories()));
        }

        repository.saveStore(store); // PK 확보

        // 5) 스케줄/슬롯 생성 (등록용 DTO 필드 사용)
        buildSchedulesAndSlots(store, dto);

        // 6) 파일 저장
        saveImages(store, files);

        return store.getStore_id();
    }

    /** 스케줄 + 슬롯 생성 */
    private void buildSchedulesAndSlots(PopupStore store, PopupDTO dto) {
        List<String> openDays = Optional.ofNullable(dto.getOpen_days()).orElse(List.of());
        if (openDays.isEmpty())
            throw new IllegalArgumentException("운영 요일(open_days)이 비어있습니다.");
        if (!StringUtils.hasText(dto.getOpen_start_time()) || !StringUtils.hasText(dto.getOpen_end_time()))
            throw new IllegalArgumentException("운영 시간(open_start_time/open_end_time)이 비어있습니다.");
        if (dto.getCapacity_per_hour() == null || dto.getCapacity_per_hour() <= 0)
            throw new IllegalArgumentException("시간당 정원(capacity_per_hour)은 1 이상이어야 합니다.");

        java.time.LocalTime start = java.time.LocalTime.parse(dto.getOpen_start_time());
        java.time.LocalTime end   = java.time.LocalTime.parse(dto.getOpen_end_time());
        if (!start.isBefore(end)) throw new IllegalArgumentException("운영 종료 시간은 시작 시간보다 커야 합니다.");

        int slotMinutes = Optional.ofNullable(dto.getSlot_minutes()).orElse(60);
        if (slotMinutes <= 0) throw new IllegalArgumentException("slot_minutes는 1분 이상이어야 합니다.");

        // 문자열 → 엔티티 enum
        Set<DayOfWeek> openEnums = new HashSet<>();
        for (String s : openDays) {
            try { openEnums.add(DayOfWeek.valueOf(s)); }
            catch (Exception e) { throw new IllegalArgumentException("올바르지 않은 요일 값: " + s); }
        }

        // 날짜 구간 순회
        List<PopupStoreSchedule> schedules = new ArrayList<>();
        List<PopupStoreSlot> slots = new ArrayList<>();

        LocalDate d = store.getStart_date();
        while (!d.isAfter(store.getEnd_date())) {
            // java.time.DayOfWeek → 내부 enum 이름 동일하므로 그대로 valueOf 가능
            DayOfWeek dow = DayOfWeek.valueOf(d.getDayOfWeek().name());
            if (openEnums.contains(dow)) {
                // 스케줄 생성
                PopupStoreSchedule sch = new PopupStoreSchedule();
                sch.setPopupStore(store);
                sch.setDayOfWeek(dow);
                sch.setDate(d);
                sch.setStart_time(start);
                sch.setEnd_time(end);
                schedules.add(sch);

                // 슬롯 생성(시간대 → slotMinutes로 쪼갬)
                long totalMin = java.time.Duration.between(start, end).toMinutes();
                int count = (int)(totalMin / slotMinutes);            // 딱 나누어 떨어지는 구간만 생성
                int baseCap = dto.getCapacity_per_hour() * slotMinutes / 60; // 1슬롯 정원
                for (int i = 0; i < count; i++) {
                    java.time.LocalTime s = start.plusMinutes((long) i * slotMinutes);
                    java.time.LocalTime e = s.plusMinutes(slotMinutes);

                    PopupStoreSlot slot = new PopupStoreSlot();
                    slot.setSchedule(sch);
                    slot.setSlot_order(i + 1);
                    slot.setStart_time(s);
                    slot.setEnd_time(e);
                    slot.setCapacity(baseCap);
                    slot.setReserved_count(0);
                    slots.add(slot);
                }
            }
            d = d.plusDays(1);
        }

        if (!schedules.isEmpty()) repository.saveSchedules(schedules);
        if (!slots.isEmpty()) repository.saveSlots(slots);
    }

    /** 이미지 저장(기존 로직 분리) */
    private void saveImages(PopupStore store, List<MultipartFile> files) {
        Path folder = Paths.get(uploadPath, "popups", String.valueOf(store.getStore_id()));
        try { Files.createDirectories(folder); }
        catch (Exception e) { throw new RuntimeException("업로드 폴더 생성 실패: " + folder, e); }

        List<Image> images = new ArrayList<>();
        for (MultipartFile mf : (files == null ? List.<MultipartFile>of() : files)) {
            if (mf.isEmpty()) continue;
            String ext = Optional.ofNullable(mf.getOriginalFilename())
                    .filter(StringUtils::hasText)
                    .map(fn -> { int i = fn.lastIndexOf('.'); return i >= 0 ? fn.substring(i + 1) : null; })
                    .orElse(null);
            String saved = java.util.UUID.randomUUID() + (ext != null ? "." + ext.toLowerCase() : "");
            Path target = folder.resolve(saved);
            try (InputStream in = mf.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                throw new RuntimeException("파일 저장 실패: " + mf.getOriginalFilename(), e);
            }
            Image img = new Image();
            img.setOriginal_name(mf.getOriginalFilename());
            img.setSaved_name(saved);
            img.setPopupStore(store);
            images.add(img);
        }
        if (!images.isEmpty()) repository.saveImages(images);
    }
    // 레코드(카테고리 행)
    public record CatRow(Long id, String name) {}
}


