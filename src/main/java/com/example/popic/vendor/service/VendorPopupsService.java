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

    // 팝업 생성 + 파일 저장
    @Transactional
    public Long createPopup(PopupDTO dto, List<MultipartFile> files) {
        // 기본 검증
        if (!StringUtils.hasText(dto.getStore_name())) throw new IllegalArgumentException("store_name 누락");
        if (dto.getStart_date() == null || dto.getEnd_date() == null) throw new IllegalArgumentException("운영 기간 누락");
        if (!StringUtils.hasText(dto.getAddress()) || !StringUtils.hasText(dto.getAddress_detail()))
            throw new IllegalArgumentException("주소(시/구 + 상세) 누락");

        // 주소 파싱 → Address
        String[] parts = dto.getAddress().trim().split("\\s+");
        if (parts.length < 2) throw new IllegalArgumentException("주소 형식 오류: \"시 구\" 필요");
        String city = parts[0];
        String district = parts[1];

        Address address = repository.findAddressByCityDistrict(city, district)
                .orElseThrow(() -> new IllegalArgumentException("주소를 찾을 수 없습니다: " + dto.getAddress()));

        // 운영자: login_id=vendor1 임시로..
        Vendor vendor;
        if (dto.getVendor() == null) {
            vendor = vendorRepository.findByLoginId(defaultVendorLoginId)
                    .orElseThrow(() -> new IllegalStateException("기본 운영자(" + defaultVendorLoginId + ")가 없습니다."));
        } else {
            vendor = vendorRepository.findById(dto.getVendor())
                    .orElseThrow(() -> new IllegalArgumentException("vendor가 존재하지 않습니다. id=" + dto.getVendor()));
        }

        // DTO → PopupStore
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
        store.setStatus(dto.getStatus());
        store.setVendor(vendor);
        store.setJoin_date(LocalDateTime.now());

        repository.saveStore(store); // PK 생성

        // 업로드 폴더: {uploadPath}/popups/{storeId}/
        Path folder = Paths.get(uploadPath, "popups", String.valueOf(store.getStore_id()));

        try {
            Files.createDirectories(folder);
        } catch (Exception e) {
            throw new RuntimeException("업로드 폴더 생성 실패: " + folder, e);
        }

        // 파일 저장 + Image 엔티티
        List<Image> images = new ArrayList<>();
        for (MultipartFile mf : (files == null ? List.<MultipartFile>of() : files)) {
            if (mf.isEmpty()) continue;
            String ext = Optional.ofNullable(mf.getOriginalFilename())
                    .filter(StringUtils::hasText)
                    .map(fn -> {
                        int i = fn.lastIndexOf('.');
                        return i >= 0 ? fn.substring(i + 1) : null;
                    })
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
        if (!images.isEmpty()) repository.saveImages(images);

        return store.getStore_id();
    }

    // 레코드(카테고리 행)
    public record CatRow(Long id, String name) {}
}
