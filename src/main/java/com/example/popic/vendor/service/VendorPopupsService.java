package com.example.popic.vendor.service;

import com.example.popic.entity.entities.Address;
import com.example.popic.entity.entities.Image;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.file.FileSave;
import com.example.popic.image.repository.ImageRepository;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.vendor.controller.VendorPopupsController;
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

    @Value("${uploadPath:C:/upload/}")
    private String uploadPath;

    // 목록 - 벤더 소유 팝업
    public List<PopupDTO> listPopupsByVendor(Long vendorId) {
        return repository.findStoresByVendorId(vendorId).stream().map(PopupDTO::new).toList();
    }

    // 공통 데이터
    public List<String> getCities() { return repository.findDistinctCities(); }
    public List<String> getDistricts(String city) { return repository.findDistrictsByCity(city); }
    public List<VendorPopupsController.CategorySimple> getCategories() {
        return repository.findAllCategories().stream()
                .map(r -> new VendorPopupsController.CategorySimple(r.id(), r.name()))
                .toList();
    }

    // 팝업 생성
    @Transactional
    public Long createPopupForVendor(Long vendorId, PopupDTO dto, List<MultipartFile> files) {
        validateForCreateOrUpdate(dto);

        // 주소 FK
        String[] parts = dto.getAddress().trim().split("\\s+");
        String city = parts[0], district = parts[1];
        Address address = repository.findAddressByCityDistrict(city, district)
                .orElseThrow(() -> new IllegalArgumentException("주소를 찾을 수 없습니다: " + dto.getAddress()));


        // 소유자
        // Vendor vendor = vendorRepository.findById(vendorId)
        //        .orElseThrow(() -> new IllegalArgumentException("vendor not found: " + vendorId));

        // 운영자 - 오류남 수정할 것
//        Vendor vendor;
//        if (dto.getVendor() == null) {
//            vendor = vendorRepository.findByLoginId(defaultVendorLoginId)
//                    .orElseThrow(() -> new IllegalStateException("기본 운영자(" + defaultVendorLoginId + ")가 없습니다."));
//        } else {
//            vendor = vendorRepository.findById(dto.getVendor().getVendor_id())
//                    .orElseThrow(() -> new IllegalArgumentException("vendor가 존재하지 않습니다. id=" + dto.getVendor()));
//        }

        // 엔티티 생성
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
        store.setStatus(dto.getStatus()); // 기본 2(승인 대기)
//        store.setVendor(vendor);
        store.setJoin_date(LocalDateTime.now());

        if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
            store.setCategories(repository.findCategoriesByIds(dto.getCategories()));
        }

        repository.saveStore(store); // PK 확보

        // 스케줄/슬롯 생성
        buildSchedulesAndSlots(store, dto);

        // 파일 저장
        saveImagesSimple(store, files);

        return store.getStore_id();
    }

    // 팝업 조회
    public PopupDTO findPopupOwnedBy(Long vendorId, Long popupId) {
        mustOwn(vendorId, popupId);
        return buildDetailDto(popupId);
    }

    // 팝업 수정
    @Transactional
    public void updatePopupOwnedBy(Long vendorId, Long popupId, PopupDTO dto) {
        validateForCreateOrUpdate(dto);
        PopupStore store = mustOwn(vendorId, popupId);

        store.setStore_name(dto.getStore_name());
        store.setDescription(dto.getDescription());
        store.setPrice(dto.getPrice());
        store.setStatus(dto.getStatus());
        store.setAddress_detail(dto.getAddress_detail());
        store.setLatitude(dto.getLatitude());
        store.setLongitude(dto.getLongitude());
        store.setCategories(repository.findCategoriesByIds(dto.getCategories()));
        store.setStart_date(dto.getStart_date());
        store.setEnd_date(dto.getEnd_date());

        repository.deleteSlotsByStoreId(popupId);
        repository.deleteSchedulesByStoreId(popupId);
        buildSchedulesAndSlots(store, dto);
    }

    // 팝업 삭제
    @Transactional
    public void deletePopupOwnedBy(Long vendorId, Long popupId) {
        mustOwn(vendorId, popupId);
        deletePopupInternal(popupId);
    }

    // 팝업 이미지 추가
    @Transactional
    public List<Long> addImagesToStoreOwnedBy(Long vendorId, Long popupId, List<MultipartFile> files) {
        mustOwn(vendorId, popupId);
        return addImagesToStoreInternal(popupId, files);
    }

    // 팝업 수정
    private void validateForCreateOrUpdate(PopupDTO dto) {
        if (!StringUtils.hasText(dto.getStore_name())) throw new IllegalArgumentException("팝업명을 입력해 주세요.");
        if (dto.getStart_date() == null || dto.getEnd_date() == null) throw new IllegalArgumentException("운영 기간 누락");
        if (!StringUtils.hasText(dto.getAddress()) || !StringUtils.hasText(dto.getAddress_detail()))
            throw new IllegalArgumentException("주소(시/구 + 상세) 누락");
        if (dto.getOpen_days() == null || dto.getOpen_days().isEmpty())
            throw new IllegalArgumentException("운영 요일(open_days)이 비어있습니다.");
        if (!StringUtils.hasText(dto.getOpen_start_time()) || !StringUtils.hasText(dto.getOpen_end_time()))
            throw new IllegalArgumentException("운영 시간(open_start_time/open_end_time)이 비어있습니다.");
        if (dto.getCapacity_per_hour() == null || dto.getCapacity_per_hour() <= 0)
            throw new IllegalArgumentException("시간당 정원(capacity_per_hour)은 1 이상이어야 합니다.");
    }

    // 존재 하지 x
    private PopupStore mustOwn(Long vendorId, Long popupId) {
        PopupStore ps = repository.findStoreById(popupId)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + popupId));
        if (ps.getVendor() == null || !ps.getVendor().getVendor_id().equals(vendorId)) {
            throw new IllegalArgumentException("forbidden: not your popup");
        }
        return ps;
    }

    // 상세 DTO 구성(스케줄/슬롯 보강)
    private PopupDTO buildDetailDto(Long id) {
        PopupStore store = repository.findStoreDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + id));

        PopupDTO dto = new PopupDTO(store);

        var schedules = repository.findSchedulesByStoreId(id);
        if (!schedules.isEmpty()) {
            Set<String> days = new LinkedHashSet<>();
            java.time.LocalTime minStart = null, maxEnd = null;
            for (var s : schedules) {
                if (s.getDayOfWeek() != null) days.add(s.getDayOfWeek().name());
                if (s.getStart_time() != null && (minStart == null || s.getStart_time().isBefore(minStart))) minStart = s.getStart_time();
                if (s.getEnd_time() != null && (maxEnd == null || s.getEnd_time().isAfter(maxEnd))) maxEnd = s.getEnd_time();
            }
            dto.setOpen_days(new ArrayList<>(days));
            if (minStart != null) dto.setOpen_start_time(minStart.toString().substring(0,5));
            if (maxEnd   != null) dto.setOpen_end_time(maxEnd.toString().substring(0,5));
        }

        var slots = repository.findSlotsByStoreId(id);
        if (!slots.isEmpty()) {
            var any = slots.get(0);
            int slotMinutes = (int) java.time.Duration.between(any.getStart_time(), any.getEnd_time()).toMinutes();
            dto.setSlot_minutes(slotMinutes);
            int capPerHour = slotMinutes > 0 ? any.getCapacity() * 60 / slotMinutes : any.getCapacity();
            dto.setCapacity_per_hour(capPerHour);
        }
        return dto;
    }

    // 스케줄/슬롯 생성
    private void buildSchedulesAndSlots(PopupStore store, PopupDTO dto) {
        var start = java.time.LocalTime.parse(dto.getOpen_start_time());
        var end   = java.time.LocalTime.parse(dto.getOpen_end_time());
        if (!start.isBefore(end)) throw new IllegalArgumentException("운영 종료 시간은 시작 시간보다 커야 합니다.");

        int slotMinutes = Optional.ofNullable(dto.getSlot_minutes()).orElse(60);
        if (slotMinutes <= 0) throw new IllegalArgumentException("slot_minutes는 1분 이상이어야 합니다.");

        Set<DayOfWeek> openEnums = new HashSet<>();
        for (String s : dto.getOpen_days()) openEnums.add(DayOfWeek.valueOf(s));

        List<PopupStoreSchedule> schedules = new ArrayList<>();
        List<PopupStoreSlot> slots = new ArrayList<>();

        LocalDate d = store.getStart_date();
        while (!d.isAfter(store.getEnd_date())) {
            DayOfWeek dow = DayOfWeek.valueOf(d.getDayOfWeek().name());
            if (openEnums.contains(dow)) {
                PopupStoreSchedule sch = new PopupStoreSchedule();
                sch.setPopupStore(store);
                sch.setDayOfWeek(dow);
                sch.setDate(d);
                sch.setStart_time(start);
                sch.setEnd_time(end);
                schedules.add(sch);

                long totalMin = java.time.Duration.between(start, end).toMinutes();
                int count = (int)(totalMin / slotMinutes);
                int baseCap = dto.getCapacity_per_hour() * slotMinutes / 60;
                for (int i = 0; i < count; i++) {
                    var s = start.plusMinutes((long) i * slotMinutes);
                    var e = s.plusMinutes(slotMinutes);

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

    // 간단 파일 저장(폴더/파일 생성)
    private void saveImagesSimple(PopupStore store, List<MultipartFile> files) {
        for (MultipartFile file : (files == null ? List.<MultipartFile>of() : files)) {
            if (file.isEmpty()) continue;
            String savedName = FileSave.fileSave("popup", file);
            Image image = Image.builder()
                    .original_name(file.getOriginalFilename())
                    .saved_name(savedName)
                    .popupStore(store)
                    .build();
            imageRepository.save(image);
        }
    }

    //팝업 내부 삭제(이미지/슬롯/스케줄/조인/스토어)
    private void deletePopupInternal(Long id) {
        PopupStore store = repository.findStoreById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found: " + id));

        repository.deleteSlotsByStoreId(id);
        repository.deleteSchedulesByStoreId(id);

        List<Image> imgs = repository.findImagesByStoreId(id);
        for (Image img : imgs) {
            try {
                java.nio.file.Files.deleteIfExists(
                        java.nio.file.Paths.get(uploadPath, "popups", String.valueOf(id), img.getSaved_name())
                );
            } catch (Exception ignored) {}
            repository.deleteImage(img);
        }
        repository.deleteCategoryLinksByStoreId(id);
        repository.deleteStore(store);
    }

    // 이미지 추가 내부 구현
    private List<Long> addImagesToStoreInternal(Long storeId, List<MultipartFile> files) {
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

    // 이미지 삭제(파일+DB)
    @Transactional
    public void deleteImage(Long imageId) {
        Image img = repository.findImageById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("image not found: " + imageId));
        Long storeId = img.getPopupStore().getStore_id();
        Path path = Paths.get(uploadPath, "popups", String.valueOf(storeId), img.getSaved_name());
        try { Files.deleteIfExists(path); } catch (Exception ignored) {}
        repository.deleteImage(img);
    }

    // 이미지 로딩(스토어/파일명)
    @Transactional(readOnly = true)
    public FilePayload loadImage(Long storeId, String savedName) throws IOException {
        Path path = Paths.get(uploadPath, "popups", String.valueOf(storeId), savedName);
        if (!Files.exists(path)) throw new IOException("not found");
        String ct = Optional.ofNullable(Files.probeContentType(path))
                .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        return new FilePayload(ct, Files.readAllBytes(path));
    }

    // 이미지 로딩(이미지ID)
    @Transactional(readOnly = true)
    public FilePayload loadImageById(Long imageId) throws IOException {
        Image img = repository.findImageById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("image not found: " + imageId));
        Long storeId = img.getPopupStore().getStore_id();
        return loadImage(storeId, img.getSaved_name());
    }

    // 카테고리 행 DTO(레포지토리 매핑에 사용)
    public record CatRow(Long id, String name) {}

    // 파일 응답 페이로드
    public record FilePayload(String contentType, byte[] bytes) {}
}
