package com.example.popic.vendor.service;

import com.example.popic.entity.entities.Address;
import com.example.popic.entity.entities.Image;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.file.FileSave;
import com.example.popic.image.dto.ImageDTO;
import com.example.popic.image.repository.ImageRepository;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.vendor.controller.VendorPopupsApiController;
import com.example.popic.vendor.repository.VendorPopupsRepository;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.example.popic.entity.entities.DayOfWeek;
import com.example.popic.entity.entities.PopupStoreSchedule;
import com.example.popic.entity.entities.PopupStoreSlot;

import java.io.IOException;
import java.time.LocalDate;

import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorPopupsService {
    private final ImageRepository imageRepository;
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
        // 기본 검증
        if (!StringUtils.hasText(dto.getStore_name())) throw new IllegalArgumentException("store_name 누락");
        if (dto.getStart_date() == null || dto.getEnd_date() == null) throw new IllegalArgumentException("운영 기간 누락");
        if (!StringUtils.hasText(dto.getAddress()) || !StringUtils.hasText(dto.getAddress_detail()))
            throw new IllegalArgumentException("주소(시/구 + 상세) 누락");

        // 주소 FK
        String[] parts = dto.getAddress().trim().split("\\s+");
        if (parts.length < 2) throw new IllegalArgumentException("주소 형식 오류: \"시 구\" 필요");
        String city = parts[0], district = parts[1];
        Address address = repository.findAddressByCityDistrict(city, district)
                .orElseThrow(() -> new IllegalArgumentException("주소를 찾을 수 없습니다: " + dto.getAddress()));

        // 운영자
        Vendor vendor;
        if (dto.getVendor() == null) {
            vendor = vendorRepository.findByLoginId(defaultVendorLoginId)
                    .orElseThrow(() -> new IllegalStateException("기본 운영자(" + defaultVendorLoginId + ")가 없습니다."));
        } else {
            vendor = vendorRepository.findById(dto.getVendor().getVendor_id())
                    .orElseThrow(() -> new IllegalArgumentException("vendor가 존재하지 않습니다. id=" + dto.getVendor()));
        }

        // 팝업 기본 정보 저장
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

        // 스케줄/슬롯 생성
        buildSchedulesAndSlots(store, dto);

        // 파일 저장
        for(MultipartFile file : files){
            System.out.println("파일저장 시작");
            String savedName = FileSave.fileSave("popup", file);
            Image image = Image.builder()
                    .original_name(file.getOriginalFilename())
                    .saved_name(savedName)
                    .popupStore(store)
                    .build();
            imageRepository.save(image);
        }

        return store.getStore_id();
    }

    // 스케줄 + 슬롯 생성
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

    // 이미지 저장(기존 로직 분리)
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

    @Transactional(readOnly = true)
    public PopupDTO findPopup(Long id) {
        PopupStore store = repository.findStoreDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + id));

        PopupDTO dto = new PopupDTO(store); // 기본 필드 + images_detail 채움

        // 스케줄 - 요일/시간
        List<PopupStoreSchedule> schedules = repository.findSchedulesByStoreId(id);
        if (!schedules.isEmpty()) {
            // 요일
            Set<String> days = new LinkedHashSet<>();
            java.time.LocalTime minStart = null, maxEnd = null;
            for (PopupStoreSchedule s : schedules) {
                if (s.getDayOfWeek() != null) days.add(s.getDayOfWeek().name());
                if (s.getStart_time() != null && (minStart == null || s.getStart_time().isBefore(minStart))) {
                    minStart = s.getStart_time();
                }
                if (s.getEnd_time() != null && (maxEnd == null || s.getEnd_time().isAfter(maxEnd))) {
                    maxEnd = s.getEnd_time();
                }
            }
            dto.setOpen_days(new ArrayList<>(days));
            if (minStart != null) dto.setOpen_start_time(minStart.toString().substring(0, 5)); // "HH:mm"
            if (maxEnd   != null) dto.setOpen_end_time(maxEnd.toString().substring(0, 5));
        }

        // 슬롯
        List<PopupStoreSlot> slots = repository.findSlotsByStoreId(id);
        if (!slots.isEmpty()) {
            PopupStoreSlot any = slots.get(0);
            int slotMinutes = (int) java.time.Duration
                    .between(any.getStart_time(), any.getEnd_time()).toMinutes();
            dto.setSlot_minutes(slotMinutes);
            int capPerHour = slotMinutes > 0 ? any.getCapacity() * 60 / slotMinutes : any.getCapacity();
            dto.setCapacity_per_hour(capPerHour);
        }

        return dto;
    }


    public record FilePayload(String contentType, byte[] bytes) {}

    @Transactional
    public List<Long> addImagesToStore(Long storeId, List<MultipartFile> files) {
        PopupStore store = repository.findStoreById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + storeId));
        List<Image> images = new ArrayList<>();
        Path folder = Paths.get(uploadPath, "popup");

        try { Files.createDirectories(folder); } catch (Exception e) {
            throw new RuntimeException("업로드 폴더 생성 실패: " + folder, e);
        }

        for (MultipartFile mf : (files == null ? List.<MultipartFile>of() : files)) {
            if (mf.isEmpty()) continue;
            String ext = Optional.ofNullable(mf.getOriginalFilename())
                    .filter(StringUtils::hasText)
                    .map(fn -> { int i = fn.lastIndexOf('.'); return i >= 0 ? fn.substring(i + 1) : null; })
                    .orElse(null);
            String saved = UUID.randomUUID() + (ext != null ? "." + ext.toLowerCase() : "");
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
        repository.saveImages(images);
        return images.stream().map(Image::getImage_id).toList();
    }

    @Transactional
    public void deleteImage(Long imageId) {
        Image img = repository.findImageById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("image not found: " + imageId));
        Long storeId = img.getPopupStore().getStore_id();
        Path path = Paths.get(uploadPath, "popups", String.valueOf(storeId), img.getSaved_name());

        try { Files.deleteIfExists(path); } catch (Exception ignored) {}

        repository.deleteImage(img);
    }

    @Transactional(readOnly = true)
    public FilePayload loadImage(Long storeId, String savedName) throws IOException {
        Path path = Paths.get(uploadPath, "popups", String.valueOf(storeId), savedName);
        if (!Files.exists(path)) throw new IOException("not found");
        String ct = Optional.ofNullable(Files.probeContentType(path))
                .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        return new FilePayload(ct, Files.readAllBytes(path));
    }

    @Transactional(readOnly = true)
    public FilePayload loadImageById(Long imageId) throws IOException {
        Image img = repository.findImageById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("image not found: " + imageId));
        Long storeId = img.getPopupStore().getStore_id();
        return loadImage(storeId, img.getSaved_name()); // 기존 loadImage 재사용
    }

    // 카테고리 행
    public record CatRow(Long id, String name) {}

    @Transactional(readOnly = true)
    public PopupDTO getPopup(Long id) {
        PopupStore ps = repository.findStoreDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + id));
        return new PopupDTO(ps);
    }


    @Transactional
    public void updatePopup(Long id, PopupDTO dto) {
        PopupStore store = repository.findStoreById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + id));
        // 필요한 필드만 업데이트 (예시)
        store.setStore_name(dto.getStore_name());
        store.setDescription(dto.getDescription());
        store.setPrice(dto.getPrice());
        store.setStatus(dto.getStatus());
        store.setAddress_detail(dto.getAddress_detail());
        store.setLatitude(dto.getLatitude());
        store.setLongitude(dto.getLongitude());
        // 카테고리
        store.setCategories(repository.findCategoriesByIds(dto.getCategories()));
        // 기간
        store.setStart_date(dto.getStart_date());
        store.setEnd_date(dto.getEnd_date());

        repository.deleteSlotsByStoreId(id);
        repository.deleteSchedulesByStoreId(id);
        buildSchedulesAndSlots(store, dto);
    }

    @Transactional
    public void deletePopup(Long id) {
        PopupStore store = repository.findStoreById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + id));

        // 슬롯/스케줄
        repository.deleteSlotsByStoreId(id);
        repository.deleteSchedulesByStoreId(id);

        // 이미지 파일/레코드
        List<Image> imgs = repository.findImagesByStoreId(id);
        for (Image img : imgs) {
            try {
                java.nio.file.Files.deleteIfExists(
                        java.nio.file.Paths.get(uploadPath, "popups", String.valueOf(id), img.getSaved_name())
                );
            } catch (Exception ignored) {}
            repository.deleteImage(img);
        }

        // 카테고리 조인 테이블
        repository.deleteCategoryLinksByStoreId(id);

        // 스토어
        repository.deleteStore(store);
    }

}


